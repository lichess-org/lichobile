function withStorage<T>(f: (s: Storage) => T | void): T | void | null {
  // can throw an exception when storage is full
  try {
    return !!window.localStorage ? f(window.localStorage) : null
  } catch (e) {}
}

export default {
  get<T>(k: string): T | null {
    return withStorage((s) => {
      const item = s.getItem(k)
      return item ? JSON.parse(item) : null
    })
  },
  remove(k: string): void {
    withStorage((s) => {
      s.removeItem(k)
    })
  },
  set<T>(k: string, v: T): void {
    withStorage((s) => {
      s.removeItem(k)
      s.setItem(k, JSON.stringify(v))
    })
  }
}
