import { Readable } from 'stream'
import { Query } from '@google-cloud/datastore'
import { _ms, CommonLogger } from '@naturalcycles/js-lib'
import type { ReadableTyped } from '@naturalcycles/nodejs-lib'
import type { DatastoreDBStreamOptions } from './datastore.model'

export class DatastoreStreamReadable<T = any> extends Readable implements ReadableTyped<T> {
  private originalLimit: number
  private rowsRetrieved = 0
  private endCursor?: string
  private running = false
  private done = false
  private lastQueryDone?: number
  private totalWait = 0

  private opt: DatastoreDBStreamOptions & { batchSize: number }

  constructor(private q: Query, opt: DatastoreDBStreamOptions, private logger: CommonLogger) {
    super({ objectMode: true })

    this.opt = {
      rssLimitMB: 1000,
      batchSize: 1000,
      ...opt,
    }

    this.originalLimit = q.limitVal

    logger.log(`!! using experimentalCursorStream !! batchSize: ${opt.batchSize}`)
  }

  private async runNextQuery(): Promise<void> {
    if (this.done) return

    if (this.lastQueryDone) {
      const now = Date.now()
      this.totalWait += now - this.lastQueryDone
    }

    this.running = true
    // console.log('running query...')

    let limit = this.opt.batchSize

    if (this.originalLimit) {
      limit = Math.min(this.opt.batchSize, this.originalLimit - this.rowsRetrieved)
    }

    // console.log(`limit: ${limit}`)
    let q = this.q.limit(limit)
    if (this.endCursor) {
      q = q.start(this.endCursor)
    }

    try {
      const [rows, info] = await q.run()

      this.rowsRetrieved += rows.length
      this.logger.log(
        `got ${rows.length} rows, ${this.rowsRetrieved} rowsRetrieved, totalWait: ${_ms(
          this.totalWait,
        )}`,
        info.moreResults,
      )

      this.endCursor = info.endCursor
      this.running = false // ready to take more _reads
      this.lastQueryDone = Date.now()

      rows.forEach(row => this.push(row))

      if (
        !info.endCursor ||
        info.moreResults === 'NO_MORE_RESULTS' ||
        (this.originalLimit && this.rowsRetrieved >= this.originalLimit)
      ) {
        this.logger.log(
          `!!!! DONE! ${this.rowsRetrieved} rowsRetrieved, totalWait: ${_ms(this.totalWait)}`,
        )
        this.push(null)
        this.done = true
      } else if (this.opt.singleBatchBuffer) {
        // here we don't start next query until we're asked (via next _read call)
        // do, let's do nothing
      } else if (this.opt.rssLimitMB) {
        const rssMB = Math.round(process.memoryUsage().rss / 1024 / 1024)

        if (rssMB <= this.opt.rssLimitMB) {
          void this.runNextQuery()
        } else {
          this.logger.log(`rssLimitMB reached ${rssMB} > ${this.opt.rssLimitMB}, pausing stream`)
        }
      }
    } catch (err) {
      console.error('DatastoreStreamReadable error!\n', err)
      this.emit('error', err)
    }
  }

  count = 0 // use for debugging

  override _read(): void {
    // console.log(`_read called ${++this.count}, wasRunning: ${this.running}`) // debugging
    this.count++
    if (this.running) {
      this.logger.log(`_read ${this.count}, wasRunning: true`)
    }

    if (this.done) {
      this.logger.warn(`!!! _read was called, but done==true`)
      return
    }

    if (!this.running) {
      void this.runNextQuery()
    }
  }
}