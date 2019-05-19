import { stringId } from '@naturalcycles/nodejs-lib'
import { CreatedUpdated, CreatedUpdatedId } from './datastore.model'

export function createdUpdatedFields (existingObject?: CreatedUpdated): CreatedUpdated {
  const now = Math.floor(Date.now() / 1000)
  return {
    created: (existingObject && existingObject.created) || now,
    updated: now,
  }
}

export function createdUpdatedIdFields (existingObject?: CreatedUpdatedId): CreatedUpdatedId {
  const now = Math.floor(Date.now() / 1000)
  return {
    created: (existingObject && existingObject.created) || now,
    id: (existingObject && existingObject.id) || stringId(),
    updated: now,
  }
}
