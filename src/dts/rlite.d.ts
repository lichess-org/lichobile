declare namespace Rlite {
  interface RouteParams {
    url: string
    params: any
  }
  interface Rlite {
    add(route: string, handler: (params: RouteParams) => void): void
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
