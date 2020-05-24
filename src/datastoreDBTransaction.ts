import { DBTransaction } from '@naturalcycles/db-lib'
import { DatastoreDB } from './datastore.db'

/**
 * https://cloud.google.com/datastore/docs/concepts/transactions#datastore-datastore-transactional-update-nodejs
 */
export class DatastoreDBTransaction extends DBTransaction {
  constructor(public db: DatastoreDB) {
    super(db)
  }

  async commit(): Promise<void> {
    const tx = this.db.ds().transaction()

    try {
      await tx.run()

      for await (const op of this._ops) {
        if (op.type === 'saveBatch') {
          await this.db.saveBatch(op.table, op.dbms, { ...op.opt, tx })
        } else if (op.type === 'deleteByIds') {
          await this.db.deleteByIds(op.table, op.ids, { ...op.opt, tx })
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
}
