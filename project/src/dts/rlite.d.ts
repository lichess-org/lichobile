declare module 'rlite-router' {
  interface RouteParams {
    url: string;
    params: any;
  }
  interface Rlite {
    add(route: string, handler: (params: RouteParams) => void): void;
    run(url: string): boolean;
    exists(url: string): boolean;
  }
  interface RliteFactory {
    new(): Rlite;
  }
  const Rlite: RliteFactory
  export = Rlite;
}
