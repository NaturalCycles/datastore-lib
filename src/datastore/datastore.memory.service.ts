import { InMemoryDB } from '@naturalcycles/db-lib'
import { CommonDBOptions } from '@naturalcycles/db-lib/src/db.model'
import { DBQuery } from '@naturalcycles/db-lib/src/dbQuery'
import { StringMap } from '@naturalcycles/js-lib'

const FIELD_MAP: StringMap = {
  __key__: 'id',
}

/**
 * In-memory limited emulation of DatastoreService API.
 */
export class DatastoreMemoryService extends InMemoryDB {
  static create (): DatastoreMemoryService {
    return new DatastoreMemoryService()
  }

  async runQuery<DBM = any> (q: DBQuery<DBM>, opts?: CommonDBOptions): Promise<DBM[]> {
    // Apply FIELD_MAP to map __key__ to 'id'
    const q2 = Object.assign(q, {
      _selectedFieldNames:
        q._selectedFieldNames && q._selectedFieldNames.map(f => FIELD_MAP[f] || f),
    })

    return super.runQuery<DBM>(q2, opts)
  }
}
