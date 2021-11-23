import { Storage } from '@capacitor/storage'

export default {
  get,
  set,
  remove(key: string): Promise<void> {
    return Storage.remove({ key })
  },
  // migration from capacitor 2.0 to 3.0
  // TODO remove after
  async migrate(): Promise<void> {
    const result = await Storage.migrate()
    console.log(result)
  },
}

function get<T>(key: string): Promise<T | null> {
  return Storage.get({ key }).then(({ value }) => {
    if (value !== null) {
      return JSON.parse(value)
    }
    else return value
  })
}

function set<T>(key: string, value: T): Promise<T> {
  return Storage.set({ key, value: JSON.stringify(value) })
  .then(() => value)
}
