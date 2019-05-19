import { deepFreeze, mockTime } from '@naturalcycles/test-lib'
import { DatastoreMemoryService } from './datastore.memory.service'
import { DatastoreService } from './datastore.service'

const ID = 'randomDatastoreService1'
const KIND = 'TestKind'
let datastoreService: DatastoreService

beforeEach(() => {
  // mocks
  jest.restoreAllMocks()
  mockTime()
  jest.spyOn(require('@naturalcycles/nodejs-lib'), 'stringId').mockImplementation(() => ID)
  datastoreService = DatastoreMemoryService.create({
    log: true,
    logData: true,
  })
})

test('save, generate id, load', async () => {
  const obj = {
    a: 'aa',
    b: 'bb',
    c: 1,
  }
  deepFreeze(obj)

  const savedObj = await datastoreService.save(KIND, obj)
  expect(savedObj).toMatchSnapshot()

  const loaded = await datastoreService.getById(KIND, savedObj.id)
  expect(loaded).toMatchObject(obj)
  expect(loaded).toMatchSnapshot()
})

test('save with id, load, delete', async () => {
  const obj = {
    a: 'aa',
    b: 'bb',
    c: 1,
    id: 'randomid123',
  }
  deepFreeze(obj)

  const savedObj = await datastoreService.save(KIND, obj)
  expect(savedObj.id).toBe(obj.id)
  expect(savedObj).toMatchObject(obj)

  let loaded = await datastoreService.getById(KIND, savedObj.id)
  expect(loaded).toMatchSnapshot()

  await datastoreService.deleteById(KIND, savedObj.id)
  loaded = await datastoreService.getById(KIND, savedObj.id)
  expect(loaded).toBeUndefined()
})

test('saveBatch, findBy, findOneBy, deleteBy', async () => {
  const obj1: any = {
    id: 'id1',
    a: 'aa',
    b: 'b1',
  }
  const obj2: any = {
    id: 'id2',
    a: 'aa',
    b: 'b2',
  }
  const obj3: any = {
    id: 'id3',
    a: 'aa2',
    b: 'b3',
  }
  deepFreeze(obj1)
  deepFreeze(obj2)
  deepFreeze(obj3)

  await datastoreService.saveBatch(KIND, [obj1, obj2, obj3])

  const items = await datastoreService.findBy(KIND, 'a', 'aa')
  expect(items.length).toBe(2)
  expect(items[0]).toMatchObject(obj1)
  expect(items[1]).toMatchObject(obj2)

  const q = datastoreService.createQuery(KIND).filter('a', 'aa')
  const count = await datastoreService.countQueryRows(q)
  // console.log(count)
  expect(count).toBe(2)

  expect(await datastoreService.findOneBy(KIND, 'b', 'b3')).toMatchObject(obj3)
  await datastoreService.deleteBy(KIND, 'b', 'b3')
  expect(await datastoreService.findOneBy(KIND, 'b', 'b3')).toBeUndefined()
})
