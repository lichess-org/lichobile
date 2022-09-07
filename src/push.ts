import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed
} from '@capacitor/push-notifications'
import { fetchText } from './http'
import challengesApi from './lichess/challenges'
import router from './router'
import session from './session'
import settings from './settings'
import { handleXhrError } from './utils'
import { isForeground } from './utils/appMode'

export default {
  isStub: false,

  init() {
    PushNotifications.addListener('registration',
      ({ value }: Token) => {
        console.debug('Push registration success, FCM token: ' + value)

        fetchText(`/mobile/register/firebase/${value}`, {
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
      (notification: PushNotificationSchema) => {
        if (isForeground()) {
          switch (notification.data['lichess.type']) {
            case 'corresAlarm':
            case 'gameTakebackOffer':
            case 'gameDrawOffer':
            case 'challengeAccept':
            case 'gameMove':
            case 'gameFinish':
              session.refresh()
              break
          }
        }
      }
    )

    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        if (action.actionId === 'tap') {
          switch (action.notification.data['lichess.type']) {
            case 'challengeAccept':
              challengesApi.refresh()
              router.set(`/game/${action.notification.data['lichess.challengeId']}`)
              break
            case 'challengeCreate':
              router.set(`/game/${action.notification.data['lichess.challengeId']}`)
              break
            case 'corresAlarm':
            case 'gameMove':
            case 'gameFinish':
            case 'gameTakebackOffer':
            case 'gameDrawOffer':
              router.set(`/game/${action.notification.data['lichess.fullId']}`)
              break
            case 'newMessage':
              router.set(`/inbox/${action.notification.data['lichess.threadId']}`)
              break
          }
        }
      }
    )
  },

  async register(): Promise<void> {
    if (settings.general.notifications.enable()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          return PushNotifications.register()
        } else {
          return Promise.reject('Permission to use push denied')
        }
      })
    }

    return Promise.resolve()
  },

  unregister(): Promise<string> {
    return fetchText('/mobile/unregister', { method: 'POST' })
  }
}
