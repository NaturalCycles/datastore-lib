import { BaseDatastoreDao } from './datastore/base.datastore.dao'
import { baseDBEntitySchema, ModelType } from './datastore/base.model'
import { DatastoreMemoryService } from './datastore/datastore.memory.service'
import {
  BaseDatastoreDaoCfg,
  BaseDBEntity,
  CreatedUpdated,
  CreatedUpdatedId,
  CreatedUpdatedVer,
  DaoOptions,
  DatastoreKey,
  DatastorePayload,
  DatastoreServiceCfg,
  DatastoreStats,
  IDatastoreOptions,
} from './datastore/datastore.model'
import { DatastoreService } from './datastore/datastore.service'
import { createdUpdatedFields, createdUpdatedIdFields } from './datastore/model.util'

export {
  CreatedUpdated,
  CreatedUpdatedId,
  CreatedUpdatedVer,
  createdUpdatedFields,
  createdUpdatedIdFields,
  DatastoreService,
  DatastoreKey,
  DatastorePayload,
  IDatastoreOptions,
  DatastoreServiceCfg,
  BaseDatastoreDaoCfg,
  DaoOptions,
  BaseDBEntity,
  DatastoreStats,
  DatastoreMemoryService,
  ModelType,
  baseDBEntitySchema,
  BaseDatastoreDao,
}
