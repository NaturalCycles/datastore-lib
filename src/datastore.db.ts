import { Transform } from 'stream'
import type { Datastore, Key, Query } from '@google-cloud/datastore'
import {
  BaseCommonDB,
  CommonDB,
  DBQuery,
  DBTransaction,
  mergeDBOperations,
  RunQueryResult,
} from '@naturalcycles/db-lib'
import {
  ObjectWithId,
  JsonSchemaAny,
  JsonSchemaBoolean,
  JsonSchemaNull,
  JsonSchemaNumber,
  JsonSchemaObject,
  JsonSchemaString,
  pMap,
  pRetry,
  _assert,
  _chunk,
  _omit,
  JsonSchemaRootObject,
  CommonLogger,
  commonLoggerMinLevel,
  pTimeout,
} from '@naturalcycles/js-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'
import { boldWhite } from '@naturalcycles/nodejs-lib/dist/colors'
import {
  DatastoreDBCfg,
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastoreDBStreamOptions,
  DatastorePayload,
  DatastorePropertyStats,
  DatastoreStats,
  DatastoreType,
} from './datastore.model'
import { DatastoreStreamReadable } from './DatastoreStreamReadable'
import { dbQueryToDatastoreQuery } from './query.util'

// Datastore (also Firestore and other Google APIs) supports max 500 of items when saving/deleting, etc.
const MAX_ITEMS = 500

const RETRY_ON = ['GOAWAY', 'UNAVAILABLE', 'UNKNOWN']
// Examples of errors:
// UNKNOWN: Stream removed

/**
 * Datastore API:
 * https://googlecloudplatform.github.io/google-cloud-node/#/docs/datastore/1.0.3/datastore
 * https://cloud.google.com/datastore/docs/datastore-api-tutorial
 */
export class DatastoreDB extends BaseCommonDB implements CommonDB {
  constructor(cfg: DatastoreDBCfg = {}) {
    super()
    this.cfg = {
      logger: console,
      ...cfg,
    }
  }

  public cfg: DatastoreDBCfg & { logger: CommonLogger }

  private cachedDatastore?: Datastore

  /**
   * Datastore.KEY
   */
  protected KEY!: symbol

  // @memo() // not used to be able to connect to many DBs in the same server instance
  ds(): Datastore {
    if (!this.cachedDatastore) {
      _assert(
        process.env['APP_ENV'] !== 'test',
        'DatastoreDB cannot be used in Test env, please use InMemoryDB',
      )

      // Lazy-loading
      const datastoreLib = require('@google-cloud/datastore')
      const DS = datastoreLib.Datastore as typeof Datastore
      this.cfg.projectId ||= this.cfg.credentials?.project_id || process.env['GOOGLE_CLOUD_PROJECT']

      _assert(this.cfg.projectId, '"projectId" is not set for DatastoreDB')

      this.cfg.logger.log(`DatastoreDB connected to ${boldWhite(this.cfg.projectId)}`)

      if (this.cfg.useLegacyGRPC) {
        this.cfg.grpc = require('grpc')
      }

      if (this.cfg.grpc) {
        this.cfg.logger.log('!!! DatastoreDB using custom grpc !!!')
      }

      this.cachedDatastore = new DS(this.cfg)
      this.KEY = this.cachedDatastore.KEY
    }

    return this.cachedDatastore
  }

  override async ping(): Promise<void> {
    await this.getAllStats()
  }

  override async getByIds<ROW extends ObjectWithId>(
    table: string,
    ids: string[],
    _opt?: DatastoreDBOptions,
  ): Promise<ROW[]> {
    if (!ids.length) return []
    const keys = ids.map(id => this.key(table, id))
    let rows: any[]

    try {
      if (this.cfg.timeout) {
        const r = await pTimeout(this.ds().get(keys), {
          timeout: this.cfg.timeout,
          name: `datastore.getByIds(${table})`,
        })
        rows = r[0]
      } else {
        rows = (await this.ds().get(keys))[0]
      }
    } catch (err) {
      this.cfg.logger.log('datastore recreated on error')

      // This is to debug "GCP Datastore Timeout issue"
      const datastoreLib = require('@google-cloud/datastore')
      const DS = datastoreLib.Datastore as typeof Datastore
      this.cachedDatastore = new DS(this.cfg)

      throw err
    }

    return (
      rows
        .map(r => this.mapId<ROW>(r))
        // Seems like datastore .get() method doesn't return items properly sorted by input ids, so we gonna sort them here
        // same ids are not expected here
        .sort((a, b) => (a.id > b.id ? 1 : -1))
    )
  }

  getQueryKind(q: Query): string {
    if (!q || !q.kinds || !q.kinds.length) return '' // should never be the case, but
    return q.kinds[0]!
  }

  override async runQuery<ROW extends ObjectWithId>(
    dbQuery: DBQuery<ROW>,
    _opt?: DatastoreDBOptions,
  ): Promise<RunQueryResult<ROW>> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    const qr = await this.runDatastoreQuery<ROW>(q)

    // Special case when projection query didn't specify 'id'
    if (dbQuery._selectedFieldNames && !dbQuery._selectedFieldNames.includes('id')) {
      qr.rows = qr.rows.map(r => _omit(r as any, ['id']))
    }

    return qr
  }

  override async runQueryCount<ROW extends ObjectWithId>(
    dbQuery: DBQuery<ROW>,
    _opt?: DatastoreDBOptions,
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

  private runQueryStream<ROW extends ObjectWithId>(
    q: Query,
    _opt?: DatastoreDBStreamOptions,
  ): ReadableTyped<ROW> {
    const opt = {
      ...this.cfg.streamOptions,
      ..._opt,
    }

    return (
      opt.experimentalCursorStream
        ? new DatastoreStreamReadable(
            q,
            opt,
            commonLoggerMinLevel(this.cfg.logger, opt.debug ? 'log' : 'warn'),
          )
        : this.ds().runQueryStream(q)
    ).pipe(
      new Transform({
        objectMode: true,
        transform: (chunk, _enc, cb) => {
          cb(null, this.mapId(chunk))
        },
      }),
    )
  }

  override streamQuery<ROW extends ObjectWithId>(
    dbQuery: DBQuery<ROW>,
    opt?: DatastoreDBStreamOptions,
  ): ReadableTyped<ROW> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.runQueryStream(q, opt)
  }

  // https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/2-structured-data/books/model-datastore.js

  /**
   * Returns saved entities with generated id/updated/created (non-mutating!)
   */
  override async saveBatch<ROW extends ObjectWithId>(
    table: string,
    rows: ROW[],
    opt: DatastoreDBSaveOptions<ROW> = {},
  ): Promise<void> {
    const entities = rows.map(obj =>
      this.toDatastoreEntity(table, obj, opt.excludeFromIndexes as string[]),
    )

    const save = pRetry(
      async (batch: DatastorePayload<ROW>[]) => {
        await (opt.tx || this.ds()).save(batch)
      },
      {
        // Here we retry the GOAWAY errors that are somewhat common for Datastore
        // Currently only retrying them here in .saveBatch(), cause probably they're only thrown when saving
        predicate: err => RETRY_ON.some(s => (err as Error)?.message.includes(s)),
        name: `DatastoreLib.saveBatch(${table})`,
        maxAttempts: 5,
        delay: 5000,
        delayMultiplier: 2,
        logFirstAttempt: false,
        logFailures: true,
        // logAll: true,
        logger: this.cfg.logger,
      },
    )

    try {
      await pMap(_chunk(entities, MAX_ITEMS), async batch => await save(batch))
    } catch (err) {
      // console.log(`datastore.save ${kind}`, { obj, entity })
      this.cfg.logger.error(
        `error in DatastoreLib.saveBatch for ${table} (${rows.length} rows)`,
        err,
      )
      // don't throw, because datastore SDK makes it in separate thread, so exception will be unhandled otherwise
      return await Promise.reject(err)
    }
  }

  override async deleteByQuery<ROW extends ObjectWithId>(
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
  override async deleteByIds(
    table: string,
    ids: string[],
    opt: DatastoreDBOptions = {},
  ): Promise<number> {
    const keys = ids.map(id => this.key(table, id))
    // eslint-disable-next-line @typescript-eslint/return-await
    await pMap(_chunk(keys, MAX_ITEMS), async batch => await (opt.tx || this.ds()).delete(batch))
    return ids.length
  }

  /**
   * https://cloud.google.com/datastore/docs/concepts/transactions#datastore-datastore-transactional-update-nodejs
   */
  override async commitTransaction(
    _tx: DBTransaction,
    opt?: DatastoreDBSaveOptions,
  ): Promise<void> {
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
          throw new Error(`DBOperation not supported: ${(op as any).type}`)
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

  // if key field exists on entity, it will be used as key (prevent to duplication of numeric keyed entities)
  toDatastoreEntity<T = any>(
    kind: string,
    o: T & { id?: string },
    excludeFromIndexes: string[] = [],
  ): DatastorePayload<T> {
    const key = this.getDsKey(o) || this.key(kind, o.id!)
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
    _assert(id, `Cannot save "${kind}" entity without "id"`)
    return this.ds().key([kind, String(id)])
  }

  getDsKey(o: any): Key | undefined {
    return o?.[this.KEY]
  }

  getKey(key: Key): string | undefined {
    const id = key.id || key.name
    return id?.toString()
  }

  override async getTables(): Promise<string[]> {
    const statsArray = await this.getAllStats()
    // Filter out tables starting with `_` by default (internal Datastore tables)
    return statsArray.map(stats => stats.kind_name).filter(table => table && !table.startsWith('_'))
  }

  override async getTableSchema<ROW extends ObjectWithId>(
    table: string,
  ): Promise<JsonSchemaRootObject<ROW>> {
    const stats = await this.getTableProperties(table)

    const s: JsonSchemaRootObject<ROW> = {
      $id: `${table}.schema.json`,
      type: 'object',
      properties: {
        id: { type: 'string' },
      } as any,
      additionalProperties: true,
      required: [],
    }

    stats
      .filter(s => !s.property_name.includes('.') && s.property_name !== 'id') // filter out objectify's "virtual properties"
      .forEach(stats => {
        const { property_name: name, property_type: dtype } = stats

        if (dtype === DatastoreType.Blob) {
          s.properties[name] = {
            instanceof: 'Buffer',
          } as JsonSchemaAny
        } else if (dtype === DatastoreType.Text || dtype === DatastoreType.String) {
          s.properties[name] = {
            type: 'string',
          } as JsonSchemaString
        } else if (dtype === DatastoreType.EmbeddedEntity) {
          s.properties[name] = {
            type: 'object',
            additionalProperties: true,
            properties: {},
            required: [],
          } as JsonSchemaObject
        } else if (dtype === DatastoreType.Integer) {
          s.properties[name] = {
            type: 'integer',
          } as JsonSchemaNumber
        } else if (dtype === DatastoreType.Float) {
          s.properties[name] = {
            type: 'number',
          } as JsonSchemaNumber
        } else if (dtype === DatastoreType.Boolean) {
          s.properties[name] = {
            type: 'boolean',
          } as JsonSchemaBoolean
        } else if (dtype === DatastoreType.DATE_TIME) {
          // Don't know how to map it properly
          s.properties[name] = {} as JsonSchemaAny
        } else if (dtype === DatastoreType.NULL) {
          // check, maybe we can just skip this type and do nothing?
          if (!s.properties[name]) {
            s.properties[name] = {
              type: 'null',
            } as JsonSchemaNull
          }
        } else {
          throw new Error(`Unknown Datastore Type '${stats.property_type}' for ${table}.${name}`)
        }
      })

    return s
  }
}
