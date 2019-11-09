import { DatastoreOptions } from '@google-cloud/datastore'
import { entity } from '@google-cloud/datastore/build/src/entity'
import { CommonDBOptions, CommonDBSaveOptions, DATA_TYPE } from '@naturalcycles/db-lib'

export type DatastoreKey = entity.Key

export interface DatastorePayload<T = any> {
  key: DatastoreKey
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

export interface DatastoreDBOptions extends CommonDBOptions {}
export interface DatastoreDBSaveOptions extends CommonDBSaveOptions {}

export interface DatastoreStats {
  composite_index_count: number
  builtin_index_count: number
  kind_name: string
  bytes: number
  entity_bytes: number
  count: number
}

export enum DATASTORE_TYPE {
  Blob = 'Blob',
  Text = 'Text',
  String = 'String',
  EmbeddedEntity = 'EmbeddedEntity',
  Float = 'Float',
  Integer = 'Integer',
  DATE_TIME = 'Date/Time',
  Boolean = 'Boolean',
  NULL = 'NULL',
}

export const datastoreTypeToDataType: Record<DATASTORE_TYPE, DATA_TYPE> = {
  [DATASTORE_TYPE.Blob]: DATA_TYPE.BINARY,
  [DATASTORE_TYPE.Text]: DATA_TYPE.STRING,
  [DATASTORE_TYPE.String]: DATA_TYPE.STRING,
  [DATASTORE_TYPE.EmbeddedEntity]: DATA_TYPE.OBJECT,
  [DATASTORE_TYPE.Float]: DATA_TYPE.FLOAT,
  [DATASTORE_TYPE.Integer]: DATA_TYPE.INT,
  [DATASTORE_TYPE.DATE_TIME]: DATA_TYPE.TIMESTAMP,
  [DATASTORE_TYPE.Boolean]: DATA_TYPE.BOOLEAN,
  [DATASTORE_TYPE.NULL]: DATA_TYPE.NULL,
}

export interface DatastorePropertyStats {
  kind_name: string
  property_name: string
  property_type: DATASTORE_TYPE
  count: number
  bytes: number
  entity_bytes: number
  builtin_index_count: number
  // timestamp: 2019-11-06T09:04:18.000Z,
  builtin_index_bytes: number
}
