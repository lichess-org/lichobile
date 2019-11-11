import { Plugins } from '@capacitor/core'

export default {
  get,
  set,
  remove(key: string): Promise<void> {
    return Plugins.Storage.remove({ key })
  }
}

function get<T>(key: string): Promise<T | null> {
  return Plugins.Storage.get({ key }).then(({ value }) => {
    if (value !== null) {
      return JSON.parse(value)
    }
    else return value
  })
}

function set<T>(key: string, value: T): Promise<T> {
  return Plugins.Storage.set({ key, value: JSON.stringify(value) })
  .then(() => value)
}
