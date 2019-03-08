import * as timemachine from 'timemachine'
import { MOCK_TS } from './mock.cnst'

export function mockTime (ts: number = MOCK_TS): void {
  timemachine.config({
    timestamp: ts * 1000,
  })
}

export function mockTimeReset (): void {
  timemachine.reset()
}
