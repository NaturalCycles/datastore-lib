import { CommonKeyValueDB, commonKeyValueDBFullSupport, DBQuery } from '@naturalcycles/db-lib'
import { IncrementTuple } from '@naturalcycles/db-lib/dist/kv/commonKeyValueDB'
import { AppError, KeyValueTuple, ObjectWithId } from '@naturalcycles/js-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'
import { DatastoreDB } from './datastore.db'
import { DatastoreDBCfg } from './datastore.model'

interface KVObject<V> {
  id: string
  v: V
}

const excludeFromIndexes: (keyof KVObject<any>)[] = ['v']

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

  async getByIds<V>(table: string, ids: string[]): Promise<KeyValueTuple<string, V>[]> {
    return (await this.db.getByIds<KVObject<V>>(table, ids)).map(r => [r.id, r.v])
  }

  async deleteByIds(table: string, ids: string[]): Promise<void> {
    await this.db.deleteByIds(table, ids)
  }

  async saveBatch<V>(table: string, entries: KeyValueTuple<string, V>[]): Promise<void> {
    await this.db.saveBatch<KVObject<V>>(
      table,
      entries.map(([id, v]) => ({ id, v })),
      {
        excludeFromIndexes,
      },
    )
  }

  streamIds(table: string, limit?: number): ReadableTyped<string> {
    const q = DBQuery.create<ObjectWithId>(table)
      .select(['id'])
      .limit(limit || 0)

    return (
      this.db
        .streamQuery(q)
        // .on('error', err => stream.emit('error', err))
        .map(r => r.id)
    )
  }

  streamValues<V>(table: string, limit?: number): ReadableTyped<V> {
    // `select v` doesn't work for some reason
    const q = DBQuery.create<KVObject<V>>(table).limit(limit || 0)

    return (
      this.db
        .streamQuery(q)
        // .on('error', err => stream.emit('error', err))
        .map(r => r.v)
    )
  }

  streamEntries<V>(table: string, limit?: number): ReadableTyped<KeyValueTuple<string, V>> {
    const q = DBQuery.create<KVObject<V>>(table).limit(limit || 0)

    return (
      this.db
        .streamQuery(q)
        // .on('error', err => stream.emit('error', err))
        .map(r => [r.id, r.v])
    )
  }

  async count(table: string): Promise<number> {
    const q = DBQuery.create<ObjectWithId>(table)
    return await this.db.runQueryCount(q)
  }

  async incrementBatch(_table: string, _entries: IncrementTuple[]): Promise<IncrementTuple[]> {
    throw new AppError('DatastoreKeyValueDB.incrementBatch() is not implemented')
  }
}
