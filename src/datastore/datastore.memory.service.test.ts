import { deepFreeze, mockTime } from '@naturalcycles/test-lib'
import { toArray } from 'rxjs/operators'
import { streamToObservable } from '../util/stream.util'
import { DatastoreMemoryService } from './datastore.memory.service'
import { DatastoreService } from './datastore.service'

interface TestKind {
  id: string
  a: string
  b: string
  c?: string
  d?: string | null
}

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

test('select', async () => {
  const obj1: any = {
    id: 'id1',
    a: 'aa',
    b: 'b1',
  }

  await datastoreService.save(KIND, obj1)

  const q = datastoreService.createQuery(KIND).select('a')
  const rows = await datastoreService.runQuery<TestKind>(q)
  // console.log({rows})
  expect(rows).toEqual([{ a: 'aa' }])
})

function mockTestKindItems (): TestKind[] {
  return [
    {
      id: 'id1',
      a: 'aa',
      b: 'b1',
      c: '2012-12-01',
      d: 'not-null',
    },
    {
      id: 'id2',
      a: 'aa',
      b: 'b2',
      c: '2012-12-02',
      d: 'not-null',
    },
    {
      id: 'id3',
      a: 'aa2',
      b: 'b3',
      c: '2012-12-07',
      d: null,
    },
  ]
}

test('streamQuery', async () => {
  const items = mockTestKindItems()
  await datastoreService.saveBatch(KIND, items)

  const q = datastoreService.createQuery(KIND).filter('a', '=', 'aa')
  const rows = await datastoreService
    .streamQuery<TestKind>(q)
    .pipe(
      // debugging
      // mergeMap(async row => {
      //   console.log({row})
      //   await new Promise(r => setTimeout(r, 500))
      //   return row
      // }, 1),
      // reduce((rows, row) => rows.concat(row), [] as TestKind[]),
      toArray(),
    )
    .toPromise()
  // console.log('done', rows)

  expect(rows.length).toBe(2)
  expect(rows).toMatchSnapshot()

  const ids = await datastoreService
    .streamQueryIds(q)
    .pipe(toArray())
    .toPromise()
  // console.log(ids)
  expect(ids).toEqual(['id1', 'id2'])
})

test('multiple filters', async () => {
  const items = mockTestKindItems()
  await datastoreService.saveBatch(KIND, items)
  const q = datastoreService
    .createQuery(KIND)
    .filter('c', '>=', '2012-12-01')
    .filter('c', '<', '2012-12-03')

  const ids = await datastoreService
    .streamQueryIds(q)
    .pipe(toArray())
    .toPromise()
  // console.log(ids)
  expect(ids).toEqual(['id1', 'id2'])
})

test('null as negation in filters', async () => {
  const items = mockTestKindItems()
  await datastoreService.saveBatch(KIND, items)
  const q = datastoreService.createQuery(KIND).filter('d', '>', null as any)

  const ids1 = await datastoreService
    .streamQueryIds(q)
    .pipe(toArray())
    .toPromise()

  expect(ids1).toEqual(['id1', 'id2'])

  const q2 = datastoreService.createQuery(KIND).filter('d', '<', null as any)

  const ids2 = await datastoreService
    .streamQueryIds(q2)
    .pipe(toArray())
    .toPromise()

  expect(ids2).toEqual(['id1', 'id2'])
})

test('runQueryStream', async () => {
  const items = mockTestKindItems()
  await datastoreService.saveBatch(KIND, items)
  const q = datastoreService.createQuery(KIND).filter('a', '=', 'aa')

  const results = await streamToObservable(datastoreService.runQueryStream(q))
    .pipe(toArray())
    .toPromise()

  expect(results).toMatchSnapshot()
})
