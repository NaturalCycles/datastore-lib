import { Query } from '@google-cloud/datastore'
import { ObjectSchema } from '@hapi/joi'
import { filterEmptyStringValues, objectNullValuesToUndefined } from '@naturalcycles/js-lib'
import { getValidationResult } from '@naturalcycles/nodejs-lib'
import { Observable } from 'rxjs'
import { flatMap, map } from 'rxjs/operators'
import { DBRelation, ModelType } from './base.model'
import { BaseDatastoreDaoCfg, DaoOptions, DatastoreKey } from './datastore.model'
import { DatastoreService } from './datastore.service'
import { createdUpdatedFields } from './model.util'

export abstract class BaseDatastoreDao<BM = any, DBM = BM, FM = BM> {
  constructor (
    private datastoreService: DatastoreService,
    private baseDatastoreDaoCfg: BaseDatastoreDaoCfg,
  ) {}

  abstract readonly KIND: string
  abstract excludeFromIndexes: string[] = []
  readonly BACKEND_RESPONSE_PROPERTY?: string
  readonly ACCOUNT_RELATION?: DBRelation
  readonly DBM_SCHEMA?: ObjectSchema
  readonly BM_SCHEMA?: ObjectSchema
  readonly FM_SCHEMA?: ObjectSchema

  // to be extended
  beforeCreate (bm: Partial<BM>): BM {
    return bm as BM
  }

  // to be extended
  beforeDBMValidate (dbm: DBM): DBM {
    return dbm
  }

  // to be extended
  async beforeDBMToBM (dbm: DBM): Promise<BM> {
    return dbm as any
  }

  // to be extended
  async beforeBMToDBM (bm: BM): Promise<DBM> {
    return bm as any
  }

  // to be extended
  async beforeBMToFM (bm: BM): Promise<FM> {
    return bm as any
  }

  // to be extended
  anonymize (dbm: DBM): DBM {
    return dbm
  }

  /**
   * Mutates object with properties: id, created, updated.
   * Returns DBM (new reference).
   */
  async bmToDBM (_bm: BM, opt: DaoOptions = {}): Promise<DBM> {
    if (_bm === undefined) return undefined as any

    let bm: BM = { ...(_bm as any) } // clone

    // Convert `null` values to `undefined` values after Java
    bm = objectNullValuesToUndefined(bm)
    bm = filterEmptyStringValues(bm)

    bm = this.datastoreService.assignIdCreatedUpdated(bm, opt.preserveUpdatedCreated)

    // Validate/convert BM
    // bm gets assigned to the new reference
    bm = this.validateAndConvert(bm, this.BM_SCHEMA, ModelType.BM, opt)

    // BM > DBM
    let dbm = await this.beforeBMToDBM(bm)

    // Validate/convert DBM
    // dbm gets assigned to the new reference
    dbm = this.validateAndConvert(dbm, this.DBM_SCHEMA, ModelType.DBM, opt)

    return dbm
  }

  async dbmsToBM (dbms: DBM[], opt: DaoOptions = {}): Promise<BM[]> {
    // try/catch if invalid?..
    return Promise.all(dbms.map(dbm => this.dbmToBM(dbm, opt)))
  }

  async bmsToDBM (bms: BM[], opt: DaoOptions = {}): Promise<DBM[]> {
    // try/catch?
    return Promise.all(bms.map(bm => this.bmToDBM(bm, opt)))
  }

  async bmsToFM (bms: BM[], opt: DaoOptions = {}): Promise<FM[]> {
    // try/catch?
    return Promise.all(bms.map(bm => this.bmToFM(bm, opt)))
  }

  anyArrayToDBM (entities: any[], opt: DaoOptions = {}): DBM[] {
    return entities.map(e => this.anyToDBM(e, opt))
  }

  anyToDBM (entity: any, opt: DaoOptions = {}): DBM {
    if (entity === undefined) return undefined as any
    // Convert `null` values to `undefined` values after Java
    let dbm: DBM = entity
    // Convert `null` values to `undefined` values after Java
    dbm = objectNullValuesToUndefined(dbm)
    dbm = filterEmptyStringValues(dbm)

    if (opt.anonymize) {
      dbm = this.anonymize(dbm)
    }

    // Validate/convert DBM
    // dbm gets assigned to the new reference
    dbm = this.validateAndConvert<DBM>(dbm, this.DBM_SCHEMA, ModelType.DBM, opt)

    return dbm
  }

  async dbmToBM (dbm: DBM, opt: DaoOptions = {}): Promise<BM> {
    if (dbm === undefined) return undefined as any

    dbm = this.anyToDBM(dbm, opt)

    // DBM > BM
    let bm = await this.beforeDBMToBM(dbm)

    // Validate/convert BM
    // bm gets assigned to the new reference
    bm = this.validateAndConvert<BM>(bm, this.BM_SCHEMA, ModelType.BM, opt)

    return bm
  }

  async bmToFM (bm: BM, opt: DaoOptions = {}): Promise<FM> {
    if (bm === undefined) return undefined as any

    // Validate/convert BM
    // bm gets assigned to the new reference
    bm = this.validateAndConvert<BM>(bm, this.BM_SCHEMA, ModelType.BM, opt)

    // BM > FM
    let fm = await this.beforeBMToFM(bm)

    // Validate/convert FM
    // fm gets assigned to the new reference
    fm = this.validateAndConvert<FM>(fm, this.FM_SCHEMA, ModelType.FM, opt)

    return fm
  }

  /**
   * Returns *converted value*.
   * Validates (unless `validate=false` passed).
   * Throws only if `throwOnError=true` passed OR if `env().throwOnEntityValidationError`
   */
  validateAndConvert<IN extends BM | DBM | FM, OUT = IN> (
    o: IN,
    schema?: ObjectSchema,
    modelType?: ModelType,
    opt: DaoOptions = {},
  ): OUT {
    // Pre-validation hooks
    if (modelType === ModelType.DBM) {
      o = this.beforeDBMValidate(o as DBM) as IN
    }

    // Return as is if no schema is passed
    if (!schema) {
      return o as any
    }

    // This will Convert and Validate
    const { value, error } = getValidationResult<IN, OUT>(o, schema, this.KIND + (modelType || ''))

    // If we care about validation and there's an error
    if (error && !opt.skipValidation) {
      if (
        (this.baseDatastoreDaoCfg.throwOnEntityValidationError && opt.throwOnError !== false) ||
        opt.throwOnError
      ) {
        if (!error.message) console.log(error)
        throw error
      } else {
        // capture by Sentry and ignore the error
        // It will still *convert* the value and return.
        if (this.baseDatastoreDaoCfg.onError) {
          this.baseDatastoreDaoCfg.onError(error)
        }
      }
    }

    return value // converted value
  }

  create (input: BM, opt: DaoOptions = {}): BM {
    if (opt.throwOnError === undefined) {
      opt.throwOnError = this.baseDatastoreDaoCfg.throwOnDaoCreateObject
    }

    let bm = Object.assign({}, this.beforeCreate(input))
    bm = this.validateAndConvert(bm, this.BM_SCHEMA, ModelType.BM, opt)

    // If no SCHEMA - return as is
    return Object.assign({}, bm)
  }

  /**
   * Will throw Error404 if entity is not found (undefined)
   */
  async requireById (id: string, opt: DaoOptions = {}): Promise<BM> {
    const r = await this.getById(id, opt)
    if (!r) throw new Error(`DB record not found: ${this.KIND}.${id}`)
    return r
  }

  async getByIdAsDBM (id?: string, opt: DaoOptions = {}): Promise<DBM | undefined> {
    const entity = await this.datastoreService.getById(this.KIND, id)
    if (!entity) return

    return this.anyToDBM(entity, opt)
  }

  async getById (id?: string, opt: DaoOptions = {}): Promise<BM | undefined> {
    const entity = await this.datastoreService.getById(this.KIND, id)
    return entity && this.dbmToBM(entity, opt)
  }

  async getByIdAsFM (id?: string, opt: DaoOptions = {}): Promise<FM | undefined> {
    const bm = await this.getById(id, opt)
    return bm && this.bmToFM(bm, opt)
  }

  async getByIdOrCreate (id: string, bmToCreate: BM, opt: DaoOptions = {}): Promise<BM> {
    const bm = await this.getById(id, opt)
    if (bm) return bm

    return this.create(bmToCreate, opt)
  }

  async getByIdOrEmpty (id: string, opt: DaoOptions = {}): Promise<BM> {
    const bm = await this.getById(id, opt)
    if (bm) return bm

    return this.create({ id, ...createdUpdatedFields() } as any, opt)
  }

  /**
   * Saves the object and returns new object (non-mutating) with id/created/updated assigned and validated.
   * todo: refactor to save (bm: BM, opt: DaoSaveOptions = {})
   */
  async save (bm: BM, opt: DaoOptions = {}): Promise<BM> {
    const [savedBM] = await this.saveBatch([bm], opt)
    return savedBM
  }

  async saveAsDBM (dbm: DBM, opt: DaoOptions = {}): Promise<DBM> {
    const [savedDBM] = await this.saveBatchAsDBM([dbm], opt)
    return savedDBM
  }

  async saveBatch (bms: BM[], opt: DaoOptions = {}): Promise<BM[]> {
    const dbms = await this.bmsToDBM(bms, opt)
    const savedDBMs = await this.datastoreService.saveBatch(
      this.KIND,
      dbms,
      this.excludeFromIndexes,
      opt,
    )
    return this.dbmsToBM(savedDBMs, opt)
  }

  async saveBatchAsDBM (_dbms: DBM[], opt: DaoOptions = {}): Promise<DBM[]> {
    const dbms = _dbms.map(dbm => {
      return this.validateAndConvert<DBM>(dbm, this.DBM_SCHEMA!, ModelType.DBM, opt)
    })

    return this.datastoreService.saveBatch(this.KIND, dbms, this.excludeFromIndexes, opt)
  }

  async findBy (by: string, value: any, limit?: number, opt: DaoOptions = {}): Promise<BM[]> {
    const q = this.datastoreService.createQuery(this.KIND).filter(by, value)
    return this.runQuery(q, opt)
  }

  // convenience
  async findByAccountId (accountId: string, opt: DaoOptions = {}): Promise<BM[]> {
    const q = this.datastoreService.createQuery(this.KIND).filter('accountId', accountId)
    return this.runQuery(q, opt)
  }

  async findOneBy (by: string, value: any, opt: DaoOptions = {}): Promise<BM | undefined> {
    const q = this.datastoreService
      .createQuery(this.KIND)
      .filter(by, value)
      .limit(1)
    const bms = await this.runQuery(q, opt)
    return bms.length ? bms[0] : undefined
  }

  async deleteById (id?: string): Promise<void> {
    await this.datastoreService.deleteById(this.KIND, id)
  }

  async deleteBy (by: string, value: any, limit?: number): Promise<void> {
    await this.datastoreService.deleteBy(this.KIND, by, value, limit)
  }

  // convenience
  async deleteByAccountId (accountId: string): Promise<void> {
    await this.datastoreService.deleteBy(this.KIND, 'accountId', accountId)
  }

  createQuery (): Query {
    return this.datastoreService.createQuery(this.KIND)
  }

  /**
   * Careful with this method!:)
   */
  async getAll (opt: DaoOptions = {}): Promise<BM[]> {
    const q = this.datastoreService.createQuery(this.KIND)
    return this.runQuery(q, opt)
  }

  // convenience alias
  getAllQuery (): Query {
    return this.datastoreService.createQuery(this.KIND)
  }

  async runQuery (q: Query, opt: DaoOptions = {}): Promise<BM[]> {
    const entities = await this.datastoreService.runQuery(q)
    return this.dbmsToBM(entities, opt)
  }

  async runQueryAsDBM (q: Query, opt: DaoOptions = {}): Promise<DBM[]> {
    const entities = await this.datastoreService.runQuery(q)
    return this.anyArrayToDBM(entities, opt)
  }

  async runProjectionQuery<T = Partial<DBM>> (q: Query): Promise<T[]> {
    return this.datastoreService.runQuery(q)
  }

  /**
   * Passes data from Datastore "as is" (as DBM)
   */
  streamQueryAsDBM (q: Query, opt: DaoOptions = { skipValidation: true }): Observable<DBM> {
    return this.datastoreService.streamQuery(q).pipe(map(entity => this.anyToDBM(entity, opt)))
  }

  /**
   * Streams as DBM from Datastore and transforms DBM > BM
   */
  streamQueryAsBM (q: Query, opt: DaoOptions = { skipValidation: true }): Observable<BM> {
    return this.datastoreService.streamQuery(q).pipe(flatMap(entity => this.dbmToBM(entity, opt)))
  }

  // proxy method, no added value
  streamQueryIds (q: Query): Observable<string> {
    return this.datastoreService.streamQueryIds(q)
  }

  key (id: string): DatastoreKey {
    return this.datastoreService.key(this.KIND, id)
  }

  // proxy method, no added value
  async countQueryRows (q: Query): Promise<number> {
    return this.datastoreService.countQueryRows(q)
  }

  deserializeJsonField<T = any> (f?: string): T {
    return JSON.parse(f || '{}')
  }

  serializeJsonField (f: any): string | undefined {
    if (f === undefined) return undefined
    return JSON.stringify(f)
  }
}
