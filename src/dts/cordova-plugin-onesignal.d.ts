
interface OneSignalConf {
  handleNotificationOpened: (data: any) => OneSignalConf
  handleNotificationReceived: (data: any) => OneSignalConf
  inFocusDisplaying: (v: number) => OneSignalConf
  endInit: () => OneSignalConf
}

interface OneSignalStatic {
  startInit: (appId: string) => OneSignalConf
  getIds: (callback: (ids: any) => void) => void
  enableSound: (v: boolean) => void
  enableVibrate: (v: boolean) => void
  setRequiresUserPrivacyConsent: (v: boolean) => void
  provideUserConsent: (v: boolean) => void
  userProvidedPrivacyConsent: (callback: (v: boolean) => void) => void
  OSInFocusDisplayOption: {
    None: number
    InAppAlert: number
    Notification: number
  }
}

interface Plugins {
  OneSignal: OneSignalStatic
}
