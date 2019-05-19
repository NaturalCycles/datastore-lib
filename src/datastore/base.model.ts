import { idSchema, objectSchema, unixTimestampSchema, verSchema } from '@naturalcycles/nodejs-lib'
import { BaseDBEntity } from './datastore.model'

export enum ModelType {
  DBM = 'DBM',
  BM = 'BM',
  FM = 'FM',
}

export enum DBRelation {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
}

export const baseDBEntitySchema = objectSchema<BaseDBEntity>({
  id: idSchema,
  created: unixTimestampSchema,
  updated: unixTimestampSchema,
  _ver: verSchema.optional(),
})
