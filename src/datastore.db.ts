import type { Datastore, Query } from '@google-cloud/datastore'
import {
  CommonDB,
  CommonDBCreateOptions,
  CommonSchema,
  CommonSchemaField,
  DATA_TYPE,
  DBQuery,
  ObjectWithId,
  RunQueryResult,
} from '@naturalcycles/db-lib'
import { _omit } from '@naturalcycles/js-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'
import { boldWhite } from '@naturalcycles/nodejs-lib/dist/colors'
import { Transform } from 'stream'
import {
  DatastoreDBCfg,
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastoreKey,
  DatastorePayload,
  DatastorePropertyStats,
  DatastoreStats,
  datastoreTypeToDataType,
} from './datastore.model'
import { DatastoreDBTransaction } from './datastoreDBTransaction'
import { dbQueryToDatastoreQuery } from './query.util'

/**
 * Datastore API:
 * https://googlecloudplatform.github.io/google-cloud-node/#/docs/datastore/1.0.3/datastore
 * https://cloud.google.com/datastore/docs/datastore-api-tutorial
 */
export class DatastoreDB implements CommonDB {
  constructor(public cfg: DatastoreDBCfg = {}) {}

  private cachedDatastore?: Datastore

  /**
   * Datastore.KEY
   */
  protected KEY!: symbol

  // @memo() // not used to be able to connect to many DBs in the same server instance
  ds(): Datastore {
    if (!this.cachedDatastore) {
      if (process.env.APP_ENV === 'test') {
        throw new Error('DatastoreDB cannot be used in Test env, please use InMemoryDB')
      }

      // Lazy-loading
      const DatastoreLib = require('@google-cloud/datastore')
      const DS = DatastoreLib.Datastore as typeof Datastore
      this.cfg.projectId =
        this.cfg.projectId || this.cfg.credentials?.project_id || process.env.GOOGLE_CLOUD_PROJECT!

      console.log(`DatastoreDB connected to ${boldWhite(this.cfg.projectId)}`)

      if (this.cfg.useLegacyGRPC) {
        this.cfg.grpc = require('grpc')
      }

      if (this.cfg.grpc) {
        console.log('!!! DatastoreDB using custom grpc !!!')
      }

      this.cachedDatastore = new DS(this.cfg)
      this.KEY = this.cachedDatastore.KEY
    }

    return this.cachedDatastore
  }

  /**
   * Method to be used by InMemoryDB
   */
  async resetCache(): Promise<void> {}

  async ping(): Promise<void> {
    await this.getAllStats()
  }

  async getByIds<DBM extends ObjectWithId>(
    table: string,
    ids: string[],
    opt?: DatastoreDBOptions,
  ): Promise<DBM[]> {
    if (!ids.length) return []
    const keys = ids.map(id => this.key(table, id))
    const [entities] = await this.ds().get(keys)

    return (
      (entities as any[])
        .map(e => this.mapId<DBM>(e))
        // Seems like datastore .get() method doesn't return items properly sorted by input ids, so we gonna sort them here
        // same ids are not expected here
        .sort((a, b) => (a.id > b.id ? 1 : -1))
    )
  }

  getQueryKind(q: Query): string {
    if (!q || !q.kinds || !q.kinds.length) return '' // should never be the case, but
    return q.kinds[0]
  }

  async runQuery<DBM extends ObjectWithId, OUT = DBM>(
    dbQuery: DBQuery<DBM>,
    opt?: DatastoreDBOptions,
  ): Promise<RunQueryResult<OUT>> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    const qr = await this.runDatastoreQuery<DBM, OUT>(q)

    // Special case when projection query didn't specify 'id'
    if (dbQuery._selectedFieldNames && !dbQuery._selectedFieldNames.includes('id')) {
      qr.records = qr.records.map(r => _omit(r as any, ['id']))
    }

    return qr
  }

  async runQueryCount(dbQuery: DBQuery, opt?: DatastoreDBOptions): Promise<number> {
    const q = dbQueryToDatastoreQuery(dbQuery.select([]), this.ds().createQuery(dbQuery.table))
    const [entities] = await this.ds().runQuery(q)
    return entities.length
  }

  async runDatastoreQuery<DBM extends ObjectWithId, OUT = DBM>(
    q: Query,
  ): Promise<RunQueryResult<OUT>> {
    const [entities, queryResult] = await this.ds().runQuery(q)

    const records = entities.map(e => this.mapId<OUT>(e))

    return {
      ...queryResult,
      records,
    }
  }

  runQueryStream<DBM = any>(q: Query): ReadableTyped<DBM> {
    return (
      this.ds()
        .runQueryStream(q)
        // Important that new instance of Transform should be created every time!
        // Otherwise they share shate and affect each other
        .pipe(
          new Transform({
            objectMode: true,
            transform: (chunk, _enc, cb) => {
              cb(null, this.mapId(chunk))
            },
          }),
        )
    )
  }

  streamQuery<DBM extends ObjectWithId, OUT = DBM>(
    dbQuery: DBQuery<DBM>,
    opt?: DatastoreDBOptions,
  ): ReadableTyped<OUT> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.runQueryStream(q)
  }

  // https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/2-structured-data/books/model-datastore.js

  /**
   * Returns saved entities with generated id/updated/created (non-mutating!)
   */
  async saveBatch<DBM extends ObjectWithId>(
    table: string,
    dbms: DBM[],
    opt: DatastoreDBSaveOptions = {},
  ): Promise<void> {
    const entities = dbms.map(obj => this.toDatastoreEntity(table, obj, opt.excludeFromIndexes))

    try {
      if (opt.tx) {
        await opt.tx.save(entities)
      } else {
        await this.ds().save(entities)
      }
    } catch (err) {
      // console.log(`datastore.save ${kind}`, { obj, entity })
      console.error('error in datastore.save! throwing', err)
      // don't throw, because datastore SDK makes it in separate thread, so exception will be unhandled otherwise
      return Promise.reject(err)
    }
  }

  async deleteByQuery<DBM extends ObjectWithId>(
    q: DBQuery<DBM>,
    opt?: DatastoreDBOptions,
  ): Promise<number> {
    const datastoreQuery = dbQueryToDatastoreQuery(q.select([]), this.ds().createQuery(q.table))
    const { records } = await this.runDatastoreQuery<DBM>(datastoreQuery)
    return await this.deleteByIds(
      q.table,
      records.map(obj => obj.id),
      opt,
    )
  }

  /**
   * Limitation: Datastore's delete returns void, so we always return all ids here as "deleted"
   * regardless if they were actually deleted or not.
   */
  async deleteByIds(table: string, ids: string[], opt: DatastoreDBOptions = {}): Promise<number> {
    const keys = ids.map(id => this.key(table, id))
    if (opt.tx) {
      await opt.tx.delete(keys)
    } else {
      await this.ds().delete(keys)
    }
    return ids.length
  }

  async getAllStats(): Promise<DatastoreStats[]> {
    const q = this.ds().createQuery('__Stat_Kind__')
    const [statsArray] = await this.ds().runQuery(q)
    return statsArray || []
  }

  /**
   * Returns undefined e.g when Table is non-existing
   */
  async getStats(table: string): Promise<DatastoreStats | undefined> {
    const q = this.ds().createQuery('__Stat_Kind__').filter('kind_name', table).limit(1)
    const [statsArray] = await this.ds().runQuery(q)
    const [stats] = statsArray
    return stats
  }

  async getStatsCount(table: string): Promise<number | undefined> {
    const stats = await this.getStats(table)
    return stats && stats.count
  }

  async getTableProperties(table: string): Promise<DatastorePropertyStats[]> {
    const q = this.ds()
      .createQuery('__Stat_PropertyType_PropertyName_Kind__')
      .filter('kind_name', table)
    const [stats] = await this.ds().runQuery(q)
    return stats
  }

  mapId<T = any>(o: any, preserveKey = false): T {
    if (!o) return o
    const r = {
      ...o,
      id: this.getKey(this.getDsKey(o)!),
    }
    if (!preserveKey) delete r[this.KEY]
    return r
  }

  // if key field is exist on entity, it will be used as key (prevent to duplication of numeric keyed entities)
  toDatastoreEntity<T = any>(
    kind: string,
    o: T & { id?: string },
    excludeFromIndexes: string[] = [],
  ): DatastorePayload<T> {
    const key = this.getDsKey(o) || this.key(kind, o.id!.toString())
    const data = Object.assign({}, o) as any
    delete data.id
    delete data[this.KEY]

    return {
      key,
      data,
      excludeFromIndexes,
    }
  }

  key(kind: string, id: string): DatastoreKey {
    return this.ds().key([kind, String(id)])
  }

  getDsKey(o: any): DatastoreKey | undefined {
    return o && o[this.KEY]
  }

  getKey(key: DatastoreKey): string | undefined {
    const id = key.id || key.name
    return id && id.toString()
  }

  async getTables(): Promise<string[]> {
    const statsArray = await this.getAllStats()
    // Filter out tables starting with `_` by default (internal Datastore tables)
    return statsArray.map(stats => stats.kind_name).filter(table => table && !table.startsWith('_'))
  }

  async getTableSchema<DBM extends ObjectWithId>(table: string): Promise<CommonSchema<DBM>> {
    const stats = await this.getTableProperties(table)

    const fieldsMap: Record<string, CommonSchemaField> = {
      id: {
        name: 'id',
        type: DATA_TYPE.STRING,
        notNull: true,
      },
    }

    stats
      .filter(s => !s.property_name.includes('.') && s.property_name !== 'id') // filter out objectify's "virtual properties"
      .forEach(stats => {
        const { property_name: name } = stats
        const type = datastoreTypeToDataType[stats.property_type]
        if (!type) {
          throw new Error(`Unknown Datastore Type '${stats.property_type}' for ${table}.${name}`)
        }

        if (type === DATA_TYPE.NULL) {
          // don't override existing type
          fieldsMap[name] = fieldsMap[name] || { name, type }
        } else {
          fieldsMap[name] = { name, type }
        }
      })

    return { table, fields: Object.values(fieldsMap) }
  }

  // no-op
  async createTable(schema: CommonSchema, opt?: CommonDBCreateOptions): Promise<void> {}

  transaction(): DatastoreDBTransaction {
    return new DatastoreDBTransaction(this)
  }
}
