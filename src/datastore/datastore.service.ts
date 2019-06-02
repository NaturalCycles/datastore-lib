import { Datastore, Query } from '@google-cloud/datastore'
import { BaseDBEntity, CommonDB, DBQuery } from '@naturalcycles/db-lib'
import { Observable } from 'rxjs'
import { Transform } from 'stream'
import { streamToObservable } from '../util/stream.util'
import {
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastoreKey,
  DatastorePayload,
  DatastoreServiceCfg,
} from './datastore.model'
import { dbQueryToDatastoreQuery } from './query.util'

/**
 * Datastore API:
 * https://googlecloudplatform.github.io/google-cloud-node/#/docs/datastore/1.0.3/datastore
 * https://cloud.google.com/datastore/docs/datastore-api-tutorial
 */
export class DatastoreService implements CommonDB {
  constructor (protected datastoreServiceCfg: DatastoreServiceCfg) {
    // for faster search later
    this.dontLogTablesData = new Set(datastoreServiceCfg.dontLogTablesData || [])
  }

  protected dontLogTablesData!: Set<string>

  private cachedDatastore?: Datastore

  /**
   * Datastore.KEY
   */
  protected KEY!: symbol

  // @memo() // not used to be able to connect to many DBs in the same server instance
  ds (): Datastore {
    if (!this.cachedDatastore) {
      if (process.env.APP_ENV === 'test') {
        throw new Error(
          'Datastore cannot be used in Test env, please use DatastoreMemoryService.mockDatastore()',
        )
      }

      // Lazy-loading
      const DatastoreLib = require('@google-cloud/datastore')
      const DS = DatastoreLib.Datastore as typeof Datastore
      const { datastoreOptions } = this.datastoreServiceCfg

      console.log(`DatastoreService init (${datastoreOptions.projectId})...`)

      this.cachedDatastore = new DS(datastoreOptions)
      this.KEY = this.cachedDatastore.KEY
    }

    return this.cachedDatastore
  }

  /**
   * Method to be used by InMemoryDB
   */
  reset (): void {}

  protected log (kind: string, msg: string, data?: any): void {
    if (this.datastoreServiceCfg.log) {
      if (data && this.datastoreServiceCfg.logData && !this.dontLogTablesData.has(kind)) {
        console.log(msg, data) // with data
      } else {
        console.log(msg) // without data
      }
    }
  }

  async getByIds<T = any> (kind: string, ids: string[], opts?: DatastoreDBOptions): Promise<T[]> {
    const started = Date.now()
    const keys = ids.map(id => this.key(kind, id))

    const entities: any[] = await this.ds().get(keys)
    const rows = entities.map(e => this.mapId<T>(e))

    if (ids.length === 1) {
      const millis = Date.now() - started
      this.log(kind, `${kind}.getById(${ids[0]}) ${millis} ms`, rows[0] || 'undefined')
    }

    return rows
  }

  getQueryKind (q: Query): string {
    if (!q || !q.kinds || !q.kinds.length) return '' // should never be the case, but
    return q.kinds[0]
  }

  async runQuery<DBM = any> (dbQuery: DBQuery<DBM>, opts?: DatastoreDBOptions): Promise<DBM[]> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.runDatastoreQuery(q)
  }

  async runQueryCount<DBM = any> (
    dbQuery: DBQuery<DBM>,
    opts?: DatastoreDBOptions,
  ): Promise<number> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table)).select([
      '__key__',
    ])
    const [entities] = await this.ds().runQuery(q)
    return entities.length
  }

  async runDatastoreQuery<T = any> (q: Query, name?: string): Promise<T[]> {
    const started = Date.now()
    const kind = this.getQueryKind(q)

    const [entities] = await this.ds().runQuery(q)
    const rows = entities.map(e => this.mapId<T>(e))

    const millis = Date.now() - started
    this.log(kind, `${kind}.${name || 'query'} ${millis} ms: ${rows.length} results`)

    return rows
  }

  private runQueryStream (q: Query): NodeJS.ReadableStream {
    return (
      this.ds()
        .runQueryStream(q)
        // Important that new instance of Transform should be created every time!
        // Otherwise they share shate and affect each other
        .pipe(
          new Transform({
            objectMode: true,
            transform: (chunk, enc, callback) => {
              callback(undefined, this.mapId(chunk))
            },
          }),
        )
    )
  }

  streamQuery<DBM = any> (dbQuery: DBQuery<DBM>, opts?: DatastoreDBOptions): Observable<DBM> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.streamDatastoreQuery<DBM>(q)
  }

  streamDatastoreQuery<DBM = any> (q: Query): Observable<DBM> {
    return streamToObservable(this.runQueryStream(q))
  }

  // https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/2-structured-data/books/model-datastore.js

  /**
   * Returns saved entities with generated id/updated/created (non-mutating!)
   */
  async saveBatch<DBM> (
    kind: string,
    dbms: DBM[],
    opt: DatastoreDBSaveOptions = {},
  ): Promise<DBM[]> {
    const started = Date.now()

    const entities = dbms.map(obj => {
      const entity = this.toDatastoreEntity(kind, obj, opt.excludeFromIndexes)
      this.log(kind, `${kind} save`, obj)
      return entity
    })

    try {
      await this.ds().save(entities)
      const millis = Date.now() - started
      const ids = dbms.map(dbm => (dbm as any).id)
      this.log(kind, `${kind}.save() ${millis} ms: ${ids.join(',')}`)
      return dbms
    } catch (err) {
      // console.log(`datastore.save ${kind}`, { obj, entity })
      console.error('error in datastore.save! throwing', err)
      // don't throw, because datastore SDK makes it in separate thread, so exception will be unhandled otherwise
      return Promise.reject(err)
    }
  }

  /**
   * Limitation: Datastore's delete returns void, so we always return all ids here as "deleted"
   * regardless if they were actually deleted or not.
   */
  async deleteByIds (kind: string, ids: string[]): Promise<string[]> {
    const started = Date.now()

    const keys = ids.map(id => this.key(kind, id))
    await this.ds().delete(keys)

    const millis = Date.now() - started
    this.log(kind, `${kind}.deleteByIds(${ids.join(',')}) ${millis} ms`)
    return ids
  }

  async deleteBy (
    kind: string,
    by: string,
    value: any,
    limit = 0,
    opt: DatastoreDBOptions = {},
  ): Promise<string[]> {
    const q = this.ds()
      .createQuery(kind)
      .filter(by, '=', value)
      .limit(limit)
      .select(['__key__'])

    const [entities] = await this.ds().runQuery(q)
    const ids = entities.map(e => this.mapId(e)).map(row => (row as BaseDBEntity).id)
    const keys = ids.map(id => this.key(kind, id))
    await this.ds().delete(keys)
    return ids
  }

  mapId<T = any> (o: any, preserveKey = false): T {
    if (!o) return o
    const r = {
      ...o,
      id: this.getKey(this.getDsKey(o)!),
    }
    if (!preserveKey) delete r[this.KEY]
    return r
  }

  // if key field is exist on entity, it will be used as key (prevent to duplication of numeric keyed entities)
  toDatastoreEntity<T = any> (
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

  key (kind: string, id: string): DatastoreKey {
    return this.ds().key([kind, String(id)])
  }

  getDsKey (o: any): DatastoreKey | undefined {
    return o && o[this.KEY]
  }

  getKey (key: DatastoreKey): string | undefined {
    const id = key.id || key.name
    return id && id.toString()
  }
}
