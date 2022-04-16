import { DatastoreDB } from './datastore.db'
import {
  DatastoreCredentials,
  DatastoreDBCfg,
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
  DatastoreDBStreamOptions,
  DatastorePayload,
  DatastorePropertyStats,
  DatastoreStats,
  DatastoreType,
} from './datastore.model'
import { DatastoreKeyValueDB, DatastoreKeyValueDBCfg } from './datastoreKeyValueDB'

export type {
  DatastorePayload,
  DatastoreDBCfg,
  DatastoreKeyValueDBCfg,
  DatastoreStats,
  DatastoreCredentials,
  DatastorePropertyStats,
  DatastoreDBStreamOptions,
  DatastoreDBOptions,
  DatastoreDBSaveOptions,
}

export { DatastoreDB, DatastoreType, DatastoreKeyValueDB }
