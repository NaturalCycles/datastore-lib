import type { Datastore, Key, Query } from '@google-cloud/datastore'
import {
  BaseCommonDB,
  CommonDB,
  CommonSchema,
  CommonSchemaField,
  DATA_TYPE,
  DBQuery,
  DBTransaction,
  mergeDBOperations,
  ObjectWithId,
  RunQueryResult,
} from '@naturalcycles/db-lib'
import { pMap, pRetry, _chunk, _omit } from '@naturalcycles/js-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'
import { boldWhite } from '@naturalcycles/nodejs-lib/dist/colors'
import { Transform } from 'stream'
import {
  DatastoreDBCfg,
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastorePayload,
  DatastorePropertyStats,
  DatastoreStats,
  datastoreTypeToDataType,
} from './datastore.model'
import { dbQueryToDatastoreQuery } from './query.util'

// Datastore (also Firestore and other Google APIs) supports max 500 of items when saving/deleting, etc.
const MAX_ITEMS = 500

/**
 * Datastore API:
 * https://googlecloudplatform.github.io/google-cloud-node/#/docs/datastore/1.0.3/datastore
 * https://cloud.google.com/datastore/docs/datastore-api-tutorial
 */
export class DatastoreDB extends BaseCommonDB implements CommonDB {
  constructor(public cfg: DatastoreDBCfg = {}) {
    super()
  }

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

  async ping(): Promise<void> {
    await this.getAllStats()
  }

  async getByIds<ROW extends ObjectWithId>(
    table: string,
    ids: string[],
    opt?: DatastoreDBOptions,
  ): Promise<ROW[]> {
    if (!ids.length) return []
    const keys = ids.map(id => this.key(table, id))
    const [entities] = await this.ds().get(keys)

    return (
      (entities as any[])
        .map(e => this.mapId<ROW>(e))
        // Seems like datastore .get() method doesn't return items properly sorted by input ids, so we gonna sort them here
        // same ids are not expected here
        .sort((a, b) => (a.id > b.id ? 1 : -1))
    )
  }

  getQueryKind(q: Query): string {
    if (!q || !q.kinds || !q.kinds.length) return '' // should never be the case, but
    return q.kinds[0]!
  }

  async runQuery<ROW extends ObjectWithId>(
    dbQuery: DBQuery<ROW>,
    opt?: DatastoreDBOptions,
  ): Promise<RunQueryResult<ROW>> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    const qr = await this.runDatastoreQuery<ROW>(q)

    // Special case when projection query didn't specify 'id'
    if (dbQuery._selectedFieldNames && !dbQuery._selectedFieldNames.includes('id')) {
      qr.rows = qr.rows.map(r => _omit(r as any, ['id']))
    }

    return qr
  }

  async runQueryCount<ROW extends ObjectWithId>(
    dbQuery: DBQuery<ROW>,
    opt?: DatastoreDBOptions,
  ): Promise<number> {
    const q = dbQueryToDatastoreQuery(dbQuery.select([]), this.ds().createQuery(dbQuery.table))
    const [entities] = await this.ds().runQuery(q)
    return entities.length
  }

  async runDatastoreQuery<ROW extends ObjectWithId>(q: Query): Promise<RunQueryResult<ROW>> {
    const [entities, queryResult] = await this.ds().runQuery(q)

    const rows = entities.map(e => this.mapId<ROW>(e))

    return {
      ...queryResult,
      rows,
    }
  }

  runQueryStream<ROW extends ObjectWithId>(q: Query): ReadableTyped<ROW> {
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

  streamQuery<ROW extends ObjectWithId>(
    dbQuery: DBQuery<ROW>,
    opt?: DatastoreDBOptions,
  ): ReadableTyped<ROW> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.runQueryStream(q)
  }

  // https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/2-structured-data/books/model-datastore.js

  /**
   * Returns saved entities with generated id/updated/created (non-mutating!)
   */
  async saveBatch<ROW extends ObjectWithId>(
    table: string,
    rows: ROW[],
    opt: DatastoreDBSaveOptions = {},
  ): Promise<void> {
    const entities = rows.map(obj => this.toDatastoreEntity(table, obj, opt.excludeFromIndexes))

    const save = await pRetry(
      async (batch: DatastorePayload<ROW>[]) => {
        await (opt.tx || this.ds()).save(batch)
      },
      {
        // Here we retry the GOAWAY errors that are somewhat common for Datastore
        // Currently only retrying them here in .saveBatch(), cause probably they're only thrown when saving
        predicate: (err: Error) => err?.message.includes('GOAWAY'),
        maxAttempts: 5,
        // logAll: true,
      },
    )

    try {
      await pMap(_chunk(entities, MAX_ITEMS), async batch => await save(batch))
    } catch (err) {
      // console.log(`datastore.save ${kind}`, { obj, entity })
      console.error('error in datastore.save! throwing', err)
      // don't throw, because datastore SDK makes it in separate thread, so exception will be unhandled otherwise
      return Promise.reject(err)
    }
  }

  async deleteByQuery<ROW extends ObjectWithId>(
    q: DBQuery<ROW>,
    opt?: DatastoreDBOptions,
  ): Promise<number> {
    const datastoreQuery = dbQueryToDatastoreQuery(q.select([]), this.ds().createQuery(q.table))
    const { rows } = await this.runDatastoreQuery<ROW>(datastoreQuery)
    return await this.deleteByIds(
      q.table,
      rows.map(obj => obj.id),
      opt,
    )
  }

  /**
   * Limitation: Datastore's delete returns void, so we always return all ids here as "deleted"
   * regardless if they were actually deleted or not.
   */
  async deleteByIds(table: string, ids: string[], opt: DatastoreDBOptions = {}): Promise<number> {
    const keys = ids.map(id => this.key(table, id))
    await pMap(_chunk(keys, MAX_ITEMS), async batch => await (opt.tx || this.ds()).delete(batch))
    return ids.length
  }

  /**
   * https://cloud.google.com/datastore/docs/concepts/transactions#datastore-datastore-transactional-update-nodejs
   */
  async commitTransaction(_tx: DBTransaction, opt?: DatastoreDBSaveOptions): Promise<void> {
    const tx = this.ds().transaction()

    try {
      await tx.run()

      const ops = mergeDBOperations(_tx.ops)

      for await (const op of ops) {
        if (op.type === 'saveBatch') {
          await this.saveBatch(op.table, op.rows, { ...opt, tx })
        } else if (op.type === 'deleteByIds') {
          await this.deleteByIds(op.table, op.ids, { ...opt, tx })
        } else {
          throw new Error(`DBOperation not supported: ${op!.type}`)
        }
      }

      await tx.commit()
    } catch (err) {
      void tx.rollback()
      throw err // rethrow
    }
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

  key(kind: string, id: string): Key {
    return this.ds().key([kind, String(id)])
  }

  getDsKey(o: any): Key | undefined {
    return o && o[this.KEY]
  }

  getKey(key: Key): string | undefined {
    const id = key.id || key.name
    return id && id.toString()
  }

  async getTables(): Promise<string[]> {
    const statsArray = await this.getAllStats()
    // Filter out tables starting with `_` by default (internal Datastore tables)
    return statsArray.map(stats => stats.kind_name).filter(table => table && !table.startsWith('_'))
  }

  async getTableSchema<ROW extends ObjectWithId>(table: string): Promise<CommonSchema<ROW>> {
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
}
