import { Storage } from '@capacitor/storage'

const result = await Storage.migrate()
console.log(result)

export default {
  get,
  set,
  remove(key: string): Promise<void> {
    return Storage.remove({ key })
  }
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
