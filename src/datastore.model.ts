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

  /**
   * Use it to set default options to stream operations,
   * e.g you can globally enable `experimentalCursorStream` here, set the batchSize, etc.
   */
  streamOptions?: DatastoreDBStreamOptions
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

export interface DatastoreDBStreamOptions extends DatastoreDBOptions {
  /**
   * Set to `true` to stream via experimental "cursor-query based stream".
   *
   * @default false
   */
  experimentalCursorStream?: boolean

  /**
   * Applicable to `experimentalCursorStream`
   *
   * @default 1000
   */
  batchSize?: number

  /**
   * Applicable to `experimentalCursorStream`
   *
   * Set to a value (number of Megabytes) to control the peak RSS size.
   * If limit is reached - streaming will pause until the stream keeps up, and then
   * resumes.
   *
   * Set to 0/undefined to disable. Stream will get "slow" then, cause it'll only run the query
   * when _read is called.
   *
   * @default 1000
   */
  rssLimitMB?: number

  /**
   * Set to `true` to log additional debug info, when using experimentalCursorStream.
   *
   * @default false
   */
  debug?: boolean
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
