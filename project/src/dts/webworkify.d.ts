declare module "webworkify" {
  const work: (fn: (self: any) => void) => Worker;
  export = work;
}
