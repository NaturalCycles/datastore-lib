import type { DatastoreOptions, Key, Transaction } from '@google-cloud/datastore'
import { CommonDBOptions, CommonDBSaveOptions } from '@naturalcycles/db-lib'

export interface DatastorePayload<T = any> {
  key: Key
  data: T
  excludeFromIndexes: string[]
}

/**
 * Extends DatastoreOptions by requiring needed properties.
 */
export interface DatastoreDBCfg extends DatastoreOptions {
  /**
   * Optional. AppEngine will infer projectId and credential automatically.
   */
  projectId?: string

  credentials?: DatastoreCredentials

  /**
   * @default false
   * set to `true` to load and use `grpc` module (legacy)
   */
  useLegacyGRPC?: boolean

  /**
   * As described here: https://github.com/googleapis/nodejs-pubsub/issues/770#issuecomment-541226361
   * Allows to set the old native library here, e.g `grpc: require('grpc')`
   */
  grpc?: any
}

export interface DatastoreCredentials {
  type?: string
  client_email?: string
  private_key?: string
  private_key_id?: string
  project_id?: string
  client_id?: string
  client_secret?: string
  refresh_token?: string
}

export interface DatastoreDBOptions extends CommonDBOptions {
  tx?: Transaction
}
export interface DatastoreDBSaveOptions extends CommonDBSaveOptions {
  tx?: Transaction
}

export interface DatastoreStats {
  composite_index_count: number
  builtin_index_count: number
  kind_name: string
  bytes: number
  entity_bytes: number
  count: number
}

export enum DatastoreType {
  Blob = 'Blob',
  Text = 'Text',
  String = 'String', // eslint-disable-line id-blacklist
  EmbeddedEntity = 'EmbeddedEntity',
  Float = 'Float',
  Integer = 'Integer',
  DATE_TIME = 'Date/Time',
  Boolean = 'Boolean', // eslint-disable-line id-blacklist
  NULL = 'NULL',
}

export interface DatastorePropertyStats {
  kind_name: string
  property_name: string
  property_type: DatastoreType
  count: number
  bytes: number
  entity_bytes: number
  builtin_index_count: number
  // timestamp: 2019-11-06T09:04:18.000Z,
  builtin_index_bytes: number
}
