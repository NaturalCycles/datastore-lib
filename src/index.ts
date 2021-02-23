import { DatastoreDB } from './datastore.db'
import {
  DatastoreCredentials,
  DatastoreDBCfg,
  DatastorePayload,
  DatastorePropertyStats,
  DatastoreStats,
  datastoreTypeToDataType,
  DATASTORE_TYPE,
} from './datastore.model'
import { getDBAdapter } from './dbAdapter'

export type {
  DatastorePayload,
  DatastoreDBCfg,
  DatastoreStats,
  DatastoreCredentials,
  DatastorePropertyStats,
}

export { DatastoreDB, DATASTORE_TYPE, datastoreTypeToDataType, getDBAdapter }
