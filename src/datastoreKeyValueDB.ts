import { CommonKeyValueDB } from '@naturalcycles/db-lib'
import { StringMap, _stringMapEntries } from '@naturalcycles/js-lib'
import { DatastoreDB } from './datastore.db'
import { DatastoreDBCfg } from './datastore.model'

interface KVObject {
  id: string
  v: Buffer
}

const excludeFromIndexes = ['v']

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

  async getByIds(table: string, ids: string[]): Promise<Buffer[]> {
    return (await this.db.getByIds<KVObject>(table, ids)).map(r => r.v)
  }

  async deleteByIds(table: string, ids: string[]): Promise<void> {
    await this.db.deleteByIds(table, ids)
  }

  async saveBatch(table: string, batch: StringMap<Buffer>): Promise<void> {
    await this.db.saveBatch<KVObject>(
      table,
      _stringMapEntries(batch).map(([id, v]) => ({ id, v })),
      {
        excludeFromIndexes,
      },
    )
  }
}
