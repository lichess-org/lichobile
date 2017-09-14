declare namespace Rlite {
  interface RouteParams<T> {
    url: string
    params: T
  }
  interface Rlite {
    add<T>(route: string, handler: (params: RouteParams<T>) => void): void
    run(url: string): boolean
    exists(url: string): boolean
  }
  interface RliteFactory {
    new(): Rlite
  }
}

declare module 'rlite-router' {
  import __Rlite = Rlite
  const rlite: __Rlite.RliteFactory
  export = rlite
}
