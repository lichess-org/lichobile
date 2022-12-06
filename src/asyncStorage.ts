import { Preferences } from '@capacitor/preferences'

export default {
  get,
  set,
  remove(key: string): Promise<void> {
    return Preferences.remove({ key })
  },
  // migration from capacitor 2.0 to 3.0
  // TODO remove after
  async migrate(): Promise<void> {
    const result = await Preferences.migrate()
    console.log(result)
  },
}

function get<T>(key: string): Promise<T | null> {
  return Preferences.get({ key }).then(({ value }) => {
    if (value !== null) {
      return JSON.parse(value)
    }
    else return value
  })
}

function set<T>(key: string, value: T): Promise<T> {
  return Preferences.set({ key, value: JSON.stringify(value) })
  .then(() => value)
}
