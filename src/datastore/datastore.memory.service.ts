import { Datastore, Query } from '@google-cloud/datastore'
import { Filter } from '@google-cloud/datastore/build/src/query'
import { _pick, StringMap } from '@naturalcycles/js-lib'
import { Observable, Subject } from 'rxjs'
import { Readable } from 'stream'
import { BaseDBEntity, DaoOptions, DatastoreServiceCfg } from './datastore.model'
import { DatastoreService } from './datastore.service'

// Kind > id > entity
type DatastoreData = StringMap<StringMap<any>>

type QueryFilterOperator = '<' | '<=' | '=' | '>=' | '>'

interface QueryFilter {
  name: string
  op: QueryFilterOperator
  val: any
}

type FilterFn = (v: any, val: any) => boolean
const FILTER_FNS: StringMap<FilterFn> = {
  '=': (v, val) => v === val,
  '<': (v, val) => v < val,
  '<=': (v, val) => v <= val,
  '>': (v, val) => v > val,
  '>=': (v, val) => v >= val,
  '!=': (v, val) => v !== val,
}

class QueryLike {
  constructor (kind: string) {
    this.kinds = [kind]
  }

  kinds!: string[]

  filters: QueryFilter[] = []

  filter (name: string, op: QueryFilterOperator | any, val: any): this {
    if (arguments.length === 2) {
      this.filters.push({
        name,
        op: '=',
        val: op,
      })
    } else {
      this.filters.push({
        name,
        op,
        val,
      })
    }

    return this
  }

  limitVal = 0

  limit (limit: number): this {
    this.limitVal = limit
    return this
  }

  order (): this {
    return this
  }

  /**
   * If defined - will return only those names.
   * __key__ is a special fieldName
   */
  selectVal?: string[]

  select (fieldNames: string | string[]): this {
    this.selectVal = typeof fieldNames === 'string' ? [fieldNames] : fieldNames
    return this
  }
}

/**
 * In-memory limited emulation of DatastoreService API.
 */
export class DatastoreMemoryService extends DatastoreService {
  constructor (datastoreServiceCfg: DatastoreServiceCfg) {
    // super({ project_id: 'Memory' } as any)
    super(datastoreServiceCfg)
  }

  static create (cfg: Partial<DatastoreServiceCfg> = {}): DatastoreMemoryService {
    return new DatastoreMemoryService({
      datastoreOptions: {
        projectId: 'memory',
        credentials: {},
      },
      ...cfg,
    })
  }

  protected KEY = Symbol('datastore_memory_key')

  ds (): Datastore {
    throw new Error('DatastoreMemoryService.ds() should never be called')
  }

  createQuery (kind: string): Query {
    return new QueryLike(kind) as any
  }

  data: DatastoreData = {}

  /**
   * Resets InMemory DB data
   */
  reset (): void {
    this.data = {}
  }

  async getById<T = any> (kind: string, id?: string): Promise<T | undefined> {
    return id && this.data && this.data[kind] && this.data[kind][id]
  }

  async saveBatch<T = any> (
    kind: string,
    _objects: T[],
    excludeFromIndexes?: string[],
    opt: DaoOptions = {},
  ): Promise<(T & BaseDBEntity)[]> {
    const objects = _objects.map(o => this.assignIdCreatedUpdated(o, opt.preserveUpdatedCreated))
    return objects.map(obj => {
      if (!this.data[kind]) this.data[kind] = {}
      this.data[kind][obj.id] = obj

      return obj
    })
  }

  async deleteById (kind: string, id: string): Promise<void> {
    if (!this.data[kind]) this.data[kind] = {}
    delete this.data[kind][id]
  }

  async deleteBy (kind: string, by: string, value: any, limit?: number): Promise<void> {
    this.data[kind] = Object.entries(this.data[kind] || {}).filter(
      ([key, val]) => !(key === by && value === val),
    )
  }

  async runQuery<T = any> (q: Query | any, name?: string): Promise<T[]> {
    // console.log(q)
    const kind = this.getQueryKind(q)

    let rows: any[] = Object.values(this.data[kind] || [])

    // .filters
    q.filters.forEach((filter: Filter) => {
      rows = rows.filter(v => {
        let fn = FILTER_FNS[filter.op]
        if ((filter.op === '>' || filter.op === '<') && filter.val === null) {
          fn = FILTER_FNS['!=']
        }
        if (fn) return fn(v[filter.name], filter.val)

        console.warn('query filter not supported yet: ', filter)
        return true
      })
    })

    // .select(fieldNames)
    if (q.selectVal && q.selectVal.length) {
      const FIELD_MAP: StringMap = {
        __key__: 'id',
      }

      const fieldNames = (q.selectVal as string[]).map(field => FIELD_MAP[field] || field)
      rows = rows.map(r => _pick(r, fieldNames))
    }

    // todo: order

    // .limit()
    if (q.limitVal) {
      rows = rows.slice(0, Math.min(q.limitVal, rows.length))
    }

    return rows
  }

  async countQueryRows (q: Query): Promise<number> {
    const rows = await this.runQuery(q)
    return rows.length
  }

  runQueryStream (q: Query): NodeJS.ReadableStream {
    const readableStream = new Readable({
      objectMode: true,
      read (size: number) {},
    })

    this.runQuery(q)
      .then(rows => {
        rows.forEach(row => readableStream.push(row))
        readableStream.push(null)
      })
      .catch(err => {
        console.log(err)
      })

    return readableStream
  }

  streamQuery<T = any> (q: Query): Observable<T> {
    const subj = new Subject<T>()

    this.runQuery<T>(q)
      .then(rows => {
        rows.forEach(row => subj.next(row))
        subj.complete()
      })
      .catch(err => {
        subj.error(err)
      })

    return subj
  }
}
