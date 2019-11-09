import { getDB } from '@naturalcycles/db-lib'
import { loadSecretsFromEnv } from '@naturalcycles/nodejs-lib'

test('getDB()', async () => {
  process.env.APP_ENV = 'master'
  process.env.DB1 = `${process.cwd()}/src`
  loadSecretsFromEnv() // need SECRET_DB1=... in .env
  const db = getDB()
  console.log(await db.getTables())
})
