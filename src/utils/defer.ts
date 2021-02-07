export interface Deferred<A> {
  promise: Promise<A>
  resolve(a: A | PromiseLike<A>): void
  reject(err: unknown): void
  state: 'pending' | 'fulfilled' | 'rejected'
}

export function defer<A>(): Deferred<A> {
  const deferred: Partial<Deferred<A>> = {
    state: 'pending'
  }
  deferred.promise = new Promise<A>((resolve, reject) => {
    deferred.resolve = (v: A) => {
      deferred.state = 'fulfilled'
      resolve(v)
    }
    deferred.reject = () => {
      deferred.state = 'rejected'
      reject()
    }
  })
  return deferred as Deferred<A>
}
