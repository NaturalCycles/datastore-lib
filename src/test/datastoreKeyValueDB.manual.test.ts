import { runCommonKeyValueDBTest } from '@naturalcycles/db-lib/dist/testing'
import { runCommonKeyValueDaoTest } from '@naturalcycles/db-lib/dist/testing/keyValueDaoTest'
import { testOnline } from '@naturalcycles/dev-lib/dist/testing'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { describe } from 'vitest'
import { DatastoreKeyValueDB } from '../datastoreKeyValueDB'

testOnline()

require('dotenv').config()
const { SECRET_GCP_SERVICE_ACCOUNT } = requireEnvKeys('SECRET_GCP_SERVICE_ACCOUNT')
process.env['APP_ENV'] = 'master'

const credentials = JSON.parse(SECRET_GCP_SERVICE_ACCOUNT)

const db = new DatastoreKeyValueDB({
  credentials,
})

describe('runCommonKeyValueDBTest', () => runCommonKeyValueDBTest(db))

describe('runCommonKeyValueDaoTest', () => runCommonKeyValueDaoTest(db))
