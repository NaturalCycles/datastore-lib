import { BaseDatastoreDao } from './datastore/base.datastore.dao'
import { DatastoreMemoryService } from './datastore/datastore.memory.service'
import {
  BaseDatastoreDaoCfg,
  DatastoreKey,
  DatastorePayload,
  DatastoreServiceCfg,
  DatastoreStats,
  IDatastoreOptions,
} from './datastore/datastore.model'
import { DatastoreService } from './datastore/datastore.service'

export {
  DatastoreService,
  DatastoreKey,
  DatastorePayload,
  IDatastoreOptions,
  DatastoreServiceCfg,
  BaseDatastoreDaoCfg,
  DatastoreStats,
  DatastoreMemoryService,
  BaseDatastoreDao,
}
