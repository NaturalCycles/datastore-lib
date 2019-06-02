import { Query } from '@google-cloud/datastore'
import { BaseDBEntity, CommonDao, DBRelation } from '@naturalcycles/db-lib'
import { CommonDaoOptions, ObjectWithId } from '@naturalcycles/db-lib/src/db.model'
import { DBQuery } from '@naturalcycles/db-lib/src/dbQuery'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { BaseDatastoreDaoCfg, DatastoreStats } from './datastore.model'

export class BaseDatastoreDao<
  BM extends BaseDBEntity = any,
  DBM extends BaseDBEntity = BM
> extends CommonDao<BM, DBM> {
  constructor (private baseDatastoreDaoCfg: BaseDatastoreDaoCfg<BM, DBM>) {
    super(baseDatastoreDaoCfg)
  }

  readonly BACKEND_RESPONSE_PROPERTY?: string
  readonly ACCOUNT_RELATION?: DBRelation

  createDatastoreQuery (): Query {
    return this.baseDatastoreDaoCfg.db.ds().createQuery(this.baseDatastoreDaoCfg.table)
  }

  // Overrides id > __key__ in Datastore
  async queryIds (q: DBQuery<DBM>, opts?: CommonDaoOptions): Promise<string[]> {
    const rows = await this.baseDatastoreDaoCfg.db.runQuery<ObjectWithId>(
      q.select(['__key__']),
      opts,
    )
    return rows.map(row => row.id)
  }

  // Overrides id > __key__ in Datastore
  streamQueryIds (q: DBQuery<DBM>, opts?: CommonDaoOptions): Observable<string> {
    return this.baseDatastoreDaoCfg.db
      .streamQuery<ObjectWithId>(q.select(['__key__']), opts)
      .pipe(map(row => row.id))
  }

  async getStats (): Promise<DatastoreStats | undefined> {
    const q = this.baseDatastoreDaoCfg.db
      .ds()
      .createQuery('__Stat_Kind__')
      .filter('kind_name', this.cfg.table)
      .limit(1)
    const [stats] = await this.baseDatastoreDaoCfg.db.runDatastoreQuery<DatastoreStats>(q)
    return stats
  }

  /**
   * Loads count from `__Stat_Kind__`, which is updated by Datastore once per 24h.
   */
  async getStatsCount (): Promise<number | undefined> {
    const stats = await this.getStats()
    return stats && stats.count
  }
}
