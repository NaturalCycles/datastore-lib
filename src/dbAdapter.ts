import { DatastoreDB } from './datastore.db'
import { DatastoreDBCfg } from './datastore.model'

export function getDBAdapter(cfgStr?: string): DatastoreDB {
  const cfg: DatastoreDBCfg = cfgStr
    ? JSON.parse(cfgStr)
    : {
        useLegacyGRPC: true,
      }
  return new DatastoreDB(cfg)
}
