import { Plugins } from '@capacitor/core'

export default {
  get<T>(key: string): Promise<T | null> {
    return Plugins.Storage.get({ key }).then(({ value }) => {
      if (value) return JSON.parse(value)
      else return null
    })
  },
  set<T>(key: string, value: T): Promise<T> {
    return Plugins.Storage.set({ key, value: JSON.stringify(value) })
    .then(() => value)
  },
  remove(key: string): Promise<void> {
    return Plugins.Storage.remove({ key })
  }
}
