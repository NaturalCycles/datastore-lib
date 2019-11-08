import { Datastore, Query } from '@google-cloud/datastore'
import {
  CommonDB,
  CommonSchema,
  CommonSchemaField,
  DATA_TYPE,
  DBQuery,
  RunQueryResult,
  SavedDBEntity,
} from '@naturalcycles/db-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'
import { Transform } from 'stream'
import {
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastoreKey,
  DatastorePayload,
  DatastorePropertyStats,
  DatastoreServiceCfg,
  DatastoreStats,
  datastoreTypeToDataType,
  IDatastoreOptions,
} from './datastore.model'
import { dbQueryToDatastoreQuery } from './query.util'

/**
 * Datastore API:
 * https://googlecloudplatform.github.io/google-cloud-node/#/docs/datastore/1.0.3/datastore
 * https://cloud.google.com/datastore/docs/datastore-api-tutorial
 */
export class DatastoreDB implements CommonDB {
  constructor(public datastoreServiceCfg: DatastoreServiceCfg) {}

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
      const { datastoreOptions = {} as IDatastoreOptions } = this.datastoreServiceCfg
      let { projectId } = datastoreOptions
      if (!projectId) {
        projectId = process.env.GOOGLE_CLOUD_PROJECT!
      }

      console.log(`DatastoreService init (${projectId})...`)

      if (datastoreOptions.grpc) {
        console.log('!!! DatastoreService custom grpc object passed !!!')
      }

      this.cachedDatastore = new DS(datastoreOptions)
      this.KEY = this.cachedDatastore.KEY
    }

    return this.cachedDatastore
  }

  /**
   * Method to be used by InMemoryDB
   */
  async resetCache(): Promise<void> {}

  async getByIds<DBM extends SavedDBEntity>(
    table: string,
    ids: string[],
    opts?: DatastoreDBOptions,
  ): Promise<DBM[]> {
    if (!ids.length) return []
    const keys = ids.map(id => this.key(table, id))
    const [entities] = await this.ds().get(keys)
    // Seems like datastore .get() method doesn't return items properly sorted by input ids, so we gonna sort them here
    // const rowsById = by((entities as any[]).map(e => this.mapId<DBM>(e)), r => r.id)
    return (entities as any[]).map(e => this.mapId<DBM>(e))
  }

  getQueryKind(q: Query): string {
    if (!q || !q.kinds || !q.kinds.length) return '' // should never be the case, but
    return q.kinds[0]
  }

  async runQuery<DBM extends SavedDBEntity, OUT = DBM>(
    dbQuery: DBQuery<any, DBM>,
    opts?: DatastoreDBOptions,
  ): Promise<RunQueryResult<OUT>> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return await this.runDatastoreQuery<DBM, OUT>(q)
  }

  async runQueryCount(dbQuery: DBQuery, opts?: DatastoreDBOptions): Promise<number> {
    const q = dbQueryToDatastoreQuery(dbQuery.select([]), this.ds().createQuery(dbQuery.table))
    const [entities] = await this.ds().runQuery(q)
    return entities.length
  }

  async runDatastoreQuery<DBM extends SavedDBEntity, OUT = DBM>(
    q: Query,
    name?: string,
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

  streamQuery<DBM extends SavedDBEntity, OUT = DBM>(
    dbQuery: DBQuery<any, DBM>,
    opts?: DatastoreDBOptions,
  ): ReadableTyped<OUT> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.runQueryStream(q)
  }

  // https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/2-structured-data/books/model-datastore.js

  /**
   * Returns saved entities with generated id/updated/created (non-mutating!)
   */
  async saveBatch<DBM extends SavedDBEntity>(
    table: string,
    dbms: DBM[],
    opt: DatastoreDBSaveOptions = {},
  ): Promise<void> {
    const entities = dbms.map(obj => this.toDatastoreEntity(table, obj, opt.excludeFromIndexes))

    try {
      await this.ds().save(entities)
    } catch (err) {
      // console.log(`datastore.save ${kind}`, { obj, entity })
      console.error('error in datastore.save! throwing', err)
      // don't throw, because datastore SDK makes it in separate thread, so exception will be unhandled otherwise
      return Promise.reject(err)
    }
  }

  async deleteByQuery<DBM extends SavedDBEntity>(
    q: DBQuery<any, DBM>,
    opts?: DatastoreDBOptions,
  ): Promise<number> {
    const datastoreQuery = dbQueryToDatastoreQuery(q.select([]), this.ds().createQuery(q.table))
    const { records } = await this.runDatastoreQuery<DBM>(datastoreQuery)
    return await this.deleteByIds(q.table, records.map(obj => obj.id), opts)
  }

  /**
   * Limitation: Datastore's delete returns void, so we always return all ids here as "deleted"
   * regardless if they were actually deleted or not.
   */
  async deleteByIds(table: string, ids: string[], opts?: DatastoreDBOptions): Promise<number> {
    const keys = ids.map(id => this.key(table, id))
    await this.ds().delete(keys)
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
    const q = this.ds()
      .createQuery('__Stat_Kind__')
      .filter('kind_name', table)
      .limit(1)
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

  async getTableSchema<DBM extends SavedDBEntity>(table: string): Promise<CommonSchema<DBM>> {
    const stats = await this.getTableProperties(table)

    const fieldsMap: Record<string, CommonSchemaField> = {}

    stats.forEach(stats => {
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
}
