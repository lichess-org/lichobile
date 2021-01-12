function withStorage<T>(f: (s: Storage) => T | void): T | void | null {
  // can throw an exception when storage is full
  try {
    return window.localStorage ? f(window.localStorage) : null
  } catch (e) { /* noop */ }
}

export default {
  get,
  set,
  remove,
}

function get<T>(k: string): T | null {
  return withStorage((s) => {
    const item = s.getItem(k)
    return item ? JSON.parse(item) : null
  })
}

function remove(k: string): void {
  withStorage((s) => {
    s.removeItem(k)
  })
}

function set<T>(k: string, v: T): void {
  withStorage((s) => {
    try {
      s.setItem(k, JSON.stringify(v))
    } catch (_) {
      // http://stackoverflow.com/questions/2603682/is-anyone-else-receiving-a-quota-exceeded-err-on-their-ipad-when-accessing-local
      s.removeItem(k)
      s.setItem(k, JSON.stringify(v))
    }
  })
}
