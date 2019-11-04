import { DatastoreOptions } from '@google-cloud/datastore'
import { entity } from '@google-cloud/datastore/build/src/entity'
import { CommonDBOptions, CommonDBSaveOptions } from '@naturalcycles/db-lib'
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

  /**
   * As described here: https://github.com/googleapis/nodejs-pubsub/issues/770#issuecomment-541226361
   * Allows to set the old native library here, e.g `grpc: require('grpc')`
   */
  grpc?: any
}

export interface DatastoreServiceCfg {
  /**
   * Optional. AppEngine will infer projectId and credential automatically.
   */
  datastoreOptions?: IDatastoreOptions
}

export interface DatastoreDBOptions extends CommonDBOptions {}
export interface DatastoreDBSaveOptions extends CommonDBSaveOptions {}

export interface DatastoreStats {
  count: number
}
