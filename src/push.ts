import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core'
import { fetchText } from './http'
import settings from './settings'
import { handleXhrError } from './utils'

const { PushNotifications } = Plugins

export default {
  init() {
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {

        console.log('Push registration success, token: ' + token.value)

        fetchText(`/mobile/register/firebase/${token.value}`, {
          method: 'POST'
        })
        .catch(handleXhrError)
      }
    )

    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error))
      }
    )

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        console.log('Push received: ' + JSON.stringify(notification))
      }
    )

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification))
      }
    )

    register()
  },

  register,

  unregister(): Promise<string> {
    return fetchText('/mobile/unregister', { method: 'POST' })
  }
}

function register(): Promise<void> {
  if (settings.general.notifications.allow()) {
    return PushNotifications.register()
  }

  return Promise.resolve()
}
