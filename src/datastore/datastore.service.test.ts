import { mockTime } from '@naturalcycles/test-lib'
import { DatastoreMemoryService } from './datastore.memory.service'

const ID = 'randomDatastoreService1'
const KIND = 'TestKind'
const datastoreService = DatastoreMemoryService.create()

beforeEach(() => {
  jest.restoreAllMocks()
  mockTime()
  jest.spyOn(require('@naturalcycles/nodejs-lib'), 'stringId').mockImplementation(() => ID)
})

test('assignIdCreatedUpdated', () => {
  const o = {
    id: '123',
    updated: 123,
    created: 123,
  }

  // Should preserve
  expect(datastoreService.assignIdCreatedUpdated(o, true)).toEqual(o)
  expect(datastoreService.assignIdCreatedUpdated(o)).toMatchSnapshot()
})

test('getQueryKind', async () => {
  const q = datastoreService.createQuery(KIND)
  const kind = datastoreService.getQueryKind(q)
  expect(kind).toBe(KIND)
})
