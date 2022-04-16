import {
  CommonDBImplementationFeatures,
  CommonDBImplementationQuirks,
  createTestItemsDBM,
  runCommonDaoTest,
  runCommonDBTest,
  TEST_TABLE,
} from '@naturalcycles/db-lib/dist/testing'
import { pMap } from '@naturalcycles/js-lib'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { DatastoreDB } from '../datastore.db'

jest.setTimeout(60000)

require('dotenv').config()
const { SECRET_GCP_SERVICE_ACCOUNT } = requireEnvKeys('SECRET_GCP_SERVICE_ACCOUNT')
process.env['APP_ENV'] = 'master'

const credentials = JSON.parse(SECRET_GCP_SERVICE_ACCOUNT)

export const datastoreDB = new DatastoreDB({
  credentials,
  useLegacyGRPC: true,
  streamOptions: {
    // experimentalCursorStream: true,
    // debug: true,
  },
})

// Seems like consistency quirks are no longer needed?
// UPD 2021-08-05: nope, still needed
const features: CommonDBImplementationFeatures = {
  // strongConsistency: false,
}
const quirks: CommonDBImplementationQuirks = {
  // 2021-10-07: fails when set to 100, bumped up to 300
  // eventualConsistencyDelay: 300,
}

describe('runCommonDBTest', () => runCommonDBTest(datastoreDB, features, quirks))

describe('runCommonDaoTest', () => runCommonDaoTest(datastoreDB, features, quirks))

test('getStats, getStatsCount non-existing table', async () => {
  expect(await datastoreDB.getStats('NonEx')).toBeUndefined()
  expect(await datastoreDB.getStatsCount('NonEx')).toBeUndefined()
})

test('getStatsCount', async () => {
  console.log(await datastoreDB.getStatsCount('Session'))
})

test('getStats', async () => {
  console.log(await datastoreDB.getStats('Session'))
})

test('getAllStats', async () => {
  console.log(await datastoreDB.getAllStats())
})

test('getTables', async () => {
  console.log(await datastoreDB.getTables())
})

test('getTableSchema', async () => {
  // console.log(await datastoreDB.getTableProperties('Account'))
  console.log(await datastoreDB.getTableSchema('Account'))
})

test.skip('GOAWAY stress test', async () => {
  const items = createTestItemsDBM(10_001)

  await pMap(items, async item => {
    await datastoreDB.saveBatch(TEST_TABLE, [item])
  })
})
