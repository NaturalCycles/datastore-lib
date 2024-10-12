import {
  CommonKeyValueDB,
  commonKeyValueDBFullSupport,
  DBQuery,
  KeyValueDBTuple,
} from '@naturalcycles/db-lib'
import { AppError, StringMap } from '@naturalcycles/js-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'
import { DatastoreDB } from './datastore.db'
import { DatastoreDBCfg } from './datastore.model'

interface KVObject {
  id: string
  v: Buffer
}

const excludeFromIndexes: (keyof KVObject)[] = ['v']

export interface DatastoreKeyValueDBCfg extends DatastoreDBCfg {}

export class DatastoreKeyValueDB implements CommonKeyValueDB {
  constructor(public cfg: DatastoreKeyValueDBCfg) {
    this.db = new DatastoreDB(cfg)
  }

  db: DatastoreDB

  support = {
    ...commonKeyValueDBFullSupport,
    increment: false,
  }

  async ping(): Promise<void> {
    await this.db.ping()
  }

  async createTable(): Promise<void> {}

  async getByIds(table: string, ids: string[]): Promise<KeyValueDBTuple[]> {
    return (await this.db.getByIds<KVObject>(table, ids)).map(r => [r.id, r.v])
  }

  async deleteByIds(table: string, ids: string[]): Promise<void> {
    await this.db.deleteByIds(table, ids)
  }

  async saveBatch(table: string, entries: KeyValueDBTuple[]): Promise<void> {
    await this.db.saveBatch<KVObject>(
      table,
      entries.map(([id, v]) => ({ id, v })),
      {
        excludeFromIndexes,
      },
    )
  }

  streamIds(table: string, limit?: number): ReadableTyped<string> {
    const q = DBQuery.create<KVObject>(table)
      .select(['id'])
      .limit(limit || 0)

    return (
      this.db
        .streamQuery(q)
        // .on('error', err => stream.emit('error', err))
        .map(r => r.id)
    )
  }

  streamValues(table: string, limit?: number): ReadableTyped<Buffer> {
    // `select v` doesn't work for some reason
    const q = DBQuery.create<KVObject>(table).limit(limit || 0)

    return (
      this.db
        .streamQuery(q)
        // .on('error', err => stream.emit('error', err))
        .map(r => r.v)
    )
  }

  streamEntries(table: string, limit?: number): ReadableTyped<KeyValueDBTuple> {
    const q = DBQuery.create<KVObject>(table).limit(limit || 0)

    return (
      this.db
        .streamQuery(q)
        // .on('error', err => stream.emit('error', err))
        .map(r => [r.id, r.v] as KeyValueDBTuple)
    )
  }

  async count(table: string): Promise<number> {
    const q = DBQuery.create<KVObject>(table)
    return await this.db.runQueryCount(q)
  }

  async increment(_table: string, _id: string, _by?: number): Promise<number> {
    throw new AppError('DatastoreKeyValueDB.increment() is not implemented')
  }

  async incrementBatch(
    _table: string,
    _incrementMap: StringMap<number>,
  ): Promise<StringMap<number>> {
    throw new AppError('DatastoreKeyValueDB.incrementBatch() is not implemented')
  }
}
