import { CommonDBTestOptions, runCommonDaoTest, runCommonDBTest } from '@naturalcycles/db-lib'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { DatastoreDB } from '../../datastore.db'

jest.setTimeout(60000)

require('dotenv').config()
const { SECRET_GCP_SERVICE_ACCOUNT } = requireEnvKeys('SECRET_GCP_SERVICE_ACCOUNT')
process.env.APP_ENV = 'master'

const credentials = JSON.parse(SECRET_GCP_SERVICE_ACCOUNT)

export const datastoreDB = new DatastoreDB({
  credentials,
  useLegacyGRPC: true,
})

const opts: CommonDBTestOptions = {
  allowGetByIdsUnsorted: true,
  eventualConsistencyDelay: 100,
}

describe('runCommonDBTest', () => runCommonDBTest(datastoreDB, opts))

describe('runCommonDaoTest', () => runCommonDaoTest(datastoreDB, opts))

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
