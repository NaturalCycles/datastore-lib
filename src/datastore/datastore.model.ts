import { DatastoreOptions } from '@google-cloud/datastore'
import { entity } from '@google-cloud/datastore/build/src/entity'
import {
  CommonDaoCfg,
  CommonDaoOptions,
  CommonDBOptions,
  CommonDBSaveOptions,
} from '@naturalcycles/db-lib'
import { CredentialBody } from 'google-auth-library'
import { DatastoreService } from './datastore.service'

export type DatastoreKey = entity.Key

export interface DatastorePayload<T = any> {
  key: DatastoreKey
  data: T
  excludeFromIndexes: string[]
}

/**
 * Extends DatastoreOptions by requiring needed properties.
 */
export interface IDatastoreOptions extends DatastoreOptions {
  projectId: string

  /**
   * Object containing client_email and private_key properties
   */
  credentials: CredentialBody
}

export interface DatastoreServiceCfg {
  datastoreOptions: IDatastoreOptions

  /**
   * False will disable all logging (defaul).
   * True will log Datastore operations (but not data).
   */
  log?: boolean

  /**
   * True will log wrote and read entries.
   */
  logData?: boolean

  /**
   * List of Tables to not log data from.
   */
  dontLogTablesData?: string[]
}

export interface BaseDatastoreDaoCfg<BM = any, DBM = BM>
  extends CommonDaoCfg<BM, DBM, DatastoreService> {}

/**
 * @default All fields default to undefined
 */
export interface DatastoreDaoOptions extends CommonDaoOptions {}

export interface DatastoreDBOptions extends CommonDBOptions {}
export interface DatastoreDBSaveOptions extends CommonDBSaveOptions {}

export interface DatastoreStats {
  count: number
}
