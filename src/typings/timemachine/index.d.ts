declare module 'timemachine' {
  interface TimemachineOptions {
    dateString?: string
    timestamp?: number
    difference?: number
    tick?: boolean
    keepTime?: boolean
  }

  export function config (options?: TimemachineOptions): void
  export function reset (): void
}
