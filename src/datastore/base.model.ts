import { idSchema, objectSchema, unixTimestampSchema, verSchema } from '@naturalcycles/nodejs-lib'

export enum ModelType {
  DBM = 'DBM',
  BM = 'BM',
  FM = 'FM',
}

export const baseDBEntitySchema = objectSchema({
  id: idSchema,
  created: unixTimestampSchema,
  updated: unixTimestampSchema,
  _ver: verSchema.optional(),
})
