import localForage from 'localforage'

const appStore = localForage.createInstance({
  driver: localForage.INDEXEDDB,
  name: 'AppStore',
  version: 1.0,
})

export default {
  getItem<T>(key: string): Promise<T | null> {
    return appStore.getItem(key)
  },
  setItem<T>(key: string, value: T): Promise<T> {
    return appStore.setItem(key, value)
  },
  removeItem(key: string): Promise<void> {
    return appStore.removeItem(key)
  }
}
