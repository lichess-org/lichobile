import * as localForage from 'localforage'

const appStore = localForage.createInstance({
  // driver: localForage.INDEXEDDB,
  name: 'AppStore',
  version: 1.0,
})

const keyRegistry = {
  session: 'session',
  trainingOfflinePuzzles: 'training.offlinePuzzles',
  chat: 'chat',
}

type Key = keyof typeof keyRegistry

export default {
  getItem<T>(key: Key): Promise<T | null> {
    return appStore.getItem(keyRegistry[key])
  },
  setItem<T>(key: Key, value: T): Promise<T> {
    return appStore.setItem(keyRegistry[key], value)
  },
  removeItem(key: Key): Promise<void> {
    return appStore.removeItem(keyRegistry[key])
  }
}
