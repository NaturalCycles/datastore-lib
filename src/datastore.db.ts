import { Datastore, Query } from '@google-cloud/datastore'
import { BaseDBEntity, CommonDB, DBQuery, RunQueryResult } from '@naturalcycles/db-lib'
import { streamToObservable } from '@naturalcycles/nodejs-lib'
import { Observable } from 'rxjs'
import { Transform } from 'stream'
import {
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastoreKey,
  DatastorePayload,
  DatastoreServiceCfg,
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

      this.cachedDatastore = new DS(datastoreOptions)
      this.KEY = this.cachedDatastore.KEY
    }

    return this.cachedDatastore
  }

  /**
   * Method to be used by InMemoryDB
   */
  async resetCache(): Promise<void> {}

  async getByIds<DBM extends BaseDBEntity>(
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

  async runQuery<DBM extends BaseDBEntity>(
    dbQuery: DBQuery<DBM>,
    opts?: DatastoreDBOptions,
  ): Promise<RunQueryResult<DBM>> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return await this.runDatastoreQuery(q)
  }

  async runQueryCount<DBM extends BaseDBEntity>(
    dbQuery: DBQuery<DBM>,
    opts?: DatastoreDBOptions,
  ): Promise<number> {
    const q = dbQueryToDatastoreQuery(dbQuery.select([]), this.ds().createQuery(dbQuery.table))
    const [entities] = await this.ds().runQuery(q)
    return entities.length
  }

  async runDatastoreQuery<DBM extends BaseDBEntity>(
    q: Query,
    name?: string,
  ): Promise<RunQueryResult<DBM>> {
    const [entities, queryResult] = await this.ds().runQuery(q)
    const records = entities.map(e => this.mapId<DBM>(e))
    return {
      ...queryResult,
      records,
    }
  }

  runQueryStream(q: Query): NodeJS.ReadableStream {
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

  streamQuery<DBM extends BaseDBEntity>(
    dbQuery: DBQuery<DBM>,
    opts?: DatastoreDBOptions,
  ): Observable<DBM> {
    const q = dbQueryToDatastoreQuery(dbQuery, this.ds().createQuery(dbQuery.table))
    return this.streamDatastoreQuery<DBM>(q)
  }

  streamDatastoreQuery<DBM extends BaseDBEntity>(q: Query): Observable<DBM> {
    return streamToObservable(this.runQueryStream(q))
  }

  // https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/2-structured-data/books/model-datastore.js

  /**
   * Returns saved entities with generated id/updated/created (non-mutating!)
   */
  async saveBatch<DBM extends BaseDBEntity>(
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

  async deleteByQuery<DBM extends BaseDBEntity>(
    q: DBQuery<DBM>,
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
}
