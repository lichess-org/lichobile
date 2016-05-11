declare module "webworkify" {
  export default function(fn: (self: any) => void): Worker;
}
