
interface OneSignalConf {
  handleNotificationOpened: (data: any) => OneSignalConf
  handleNotificationReceived: (data: any) => OneSignalConf
  inFocusDisplaying: (v: number) => OneSignalConf
  endInit: () => OneSignalConf
}

interface OneSignalStatic {
  startInit: (appId: string, gcmId?: string) => OneSignalConf
  getIds: (callback: (ids: any) => void) => void
  enableSound: (v: boolean) => void
  enableVibrate: (v: boolean) => void
  OSInFocusDisplayOption: {
    None: number
  }
}

interface Plugins {
  OneSignal: OneSignalStatic
}
