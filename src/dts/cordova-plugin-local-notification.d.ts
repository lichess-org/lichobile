type LocalNotificationObj = any

declare interface LocalNotification {
  data: any
}

interface CordovaPlugins {
  notification: LocalNotificationObj
}
