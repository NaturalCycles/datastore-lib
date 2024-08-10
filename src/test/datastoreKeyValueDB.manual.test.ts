import { CommonKeyValueDao } from '@naturalcycles/db-lib'
import { runCommonKeyValueDBTest, TEST_TABLE } from '@naturalcycles/db-lib/dist/testing'
import { runCommonKeyValueDaoTest } from '@naturalcycles/db-lib/dist/testing/keyValueDaoTest'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { DatastoreKeyValueDB } from '../datastoreKeyValueDB'

jest.setTimeout(60000)

require('dotenv').config()
const { SECRET_GCP_SERVICE_ACCOUNT } = requireEnvKeys('SECRET_GCP_SERVICE_ACCOUNT')
process.env['APP_ENV'] = 'master'

const credentials = JSON.parse(SECRET_GCP_SERVICE_ACCOUNT)

const db = new DatastoreKeyValueDB({
  credentials,
})

const dao = new CommonKeyValueDao<Buffer>({
  db,
  table: TEST_TABLE,
})

describe('runCommonKeyValueDBTest', () => runCommonKeyValueDBTest(db))

describe('runCommonKeyValueDaoTest', () => runCommonKeyValueDaoTest(dao))
