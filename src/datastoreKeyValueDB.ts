import { CommonKeyValueDB, DBQuery, KeyValueDBTuple, ObjectWithId } from '@naturalcycles/db-lib'
import { ErrorMode } from '@naturalcycles/js-lib'
import { ReadableTyped, transformMapSimple } from '@naturalcycles/nodejs-lib'
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
    const q = DBQuery.create(table)
      .select(['id'])
      .limit(limit || 0)

    return this.db.streamQuery<KVObject>(q).pipe(
      transformMapSimple<ObjectWithId, string>(objectWithId => objectWithId.id, {
        errorMode: ErrorMode.SUPPRESS, // cause .pipe() cannot propagate errors
      }),
    )
  }

  streamValues(table: string, limit?: number): ReadableTyped<Buffer> {
    // `select v` doesn't work for some reason
    const q = DBQuery.create(table).limit(limit || 0)

    return this.db.streamQuery<KVObject>(q).pipe(
      transformMapSimple<{ v: Buffer }, Buffer>(obj => obj.v, {
        errorMode: ErrorMode.SUPPRESS, // cause .pipe() cannot propagate errors
      }),
    )
  }

  streamEntries(table: string, limit?: number): ReadableTyped<KeyValueDBTuple> {
    const q = DBQuery.create(table).limit(limit || 0)

    return this.db.streamQuery<KVObject>(q).pipe(
      transformMapSimple<KVObject, KeyValueDBTuple>(obj => [obj.id, obj.v], {
        errorMode: ErrorMode.SUPPRESS, // cause .pipe() cannot propagate errors
      }),
    )
  }
}
