import { generateStringId } from '../util/security.util'
import { timeUtil } from '../util/time.util'
import { CreatedUpdated, CreatedUpdatedId } from './datastore.model'

export function createdUpdatedFields (existingObject?: CreatedUpdated): CreatedUpdated {
  const now = timeUtil.nowUnixtime()
  return {
    created: (existingObject && existingObject.created) || now,
    updated: now,
  }
}

export function createdUpdatedIdFields (existingObject?: CreatedUpdatedId): CreatedUpdatedId {
  const now = timeUtil.nowUnixtime()
  return {
    created: (existingObject && existingObject.created) || now,
    id: (existingObject && existingObject.id) || generateStringId(),
    updated: now,
  }
}
