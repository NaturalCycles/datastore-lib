import { TEST_TABLE } from '@naturalcycles/db-lib/dist/testing'
import { expect, test } from 'vitest'
import { DatastoreDB } from './datastore.db'

test('should throw on missing id', async () => {
  const db = new DatastoreDB()
  // const ds = db.ds()

  // Should not throw here
  await db.saveBatch(TEST_TABLE, [])

  await expect(
    db.saveBatch(TEST_TABLE, [{ k: 'k' } as any]),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[AssertionError: Cannot save "TEST_TABLE" entity without "id"]`,
  )
})
