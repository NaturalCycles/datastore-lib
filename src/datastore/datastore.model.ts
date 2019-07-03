import { DatastoreOptions } from '@google-cloud/datastore'
import { entity } from '@google-cloud/datastore/build/src/entity'
import { JoiValidationError } from '@naturalcycles/nodejs-lib'
import { CredentialBody } from 'google-auth-library'

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

export interface BaseDatastoreDaoCfg {
  throwOnEntityValidationError?: boolean
  throwOnDaoCreateObject?: boolean

  /**
   * Called when validation error occurs.
   * Called ONLY when error is NOT thrown (when throwOnEntityValidationError is off)
   */
  onError?: (err: JoiValidationError) => any
}

/**
 * @default All fields default to undefined
 */
export interface DaoOptions {
  skipValidation?: boolean
  throwOnError?: boolean
  preserveUpdatedCreated?: boolean

  /**
   * If true - data will be anonymized (by calling a BaseDao.anonymize() hook that you can extend in your Dao implementation).
   * Only applicable to loading/querying/streaming_loading operations (n/a for saving).
   * There is additional validation applied AFTER Anonymization, so your anonymization implementation should keep the object valid (DBM/BM/FM).
   */
  anonymize?: boolean
}

export interface CreatedUpdated {
  created: number
  updated: number
}

export interface CreatedUpdatedId extends CreatedUpdated {
  id: string
}

export interface CreatedUpdatedVer {
  created: number
  updated: number
  _ver?: number
}

export interface BaseDBEntity {
  id: string
  created: number
  updated: number
  _ver?: number
}

export interface DatastoreStats {
  count: number
}
