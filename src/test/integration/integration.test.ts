import {
  CommonDao,
  CommonDBTestOptions,
  runCommonDaoTest,
  runCommonDBTest,
  TEST_TABLE,
  TestItem,
  testItemSchema,
} from '@naturalcycles/db-lib'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { DatastoreDB } from '../../datastore.db'

jest.setTimeout(60000)

require('dotenv').config()
const { SECRET_GCP_SERVICE_ACCOUNT } = requireEnvKeys('SECRET_GCP_SERVICE_ACCOUNT')
process.env.APP_ENV = 'master'

const credentials = JSON.parse(SECRET_GCP_SERVICE_ACCOUNT)
const projectId = credentials.project_id

export const datastoreDB = new DatastoreDB({
  datastoreOptions: {
    projectId,
    credentials,
  },
})

export const testItemDao = new CommonDao<TestItem>({
  table: TEST_TABLE,
  db: datastoreDB,
  bmSchema: testItemSchema,
  dbmSchema: testItemSchema,
})

const opts: CommonDBTestOptions = {
  allowGetByIdsUnsorted: true,
}

test('runCommonDBTest', async () => {
  await runCommonDBTest(datastoreDB, opts)
})

test('runCommonDaoTest', async () => {
  await runCommonDaoTest(testItemDao, opts)
})
