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
      const status = await PushNotifications.checkPermissions()
      switch (status.receive) {
        case 'denied':
          return Promise.reject('Permission to use push denied')
        case 'prompt':
        case 'prompt-with-rationale':
          const r = await PushNotifications.requestPermissions()
          if (r.receive === 'granted') return PushNotifications.register()
          else Promise.reject('Permission to use push denied')
        case 'granted': return PushNotifications.register()
      }
    }

    return Promise.resolve()
  },

  unregister(): Promise<string> {
    return fetchText('/mobile/unregister', { method: 'POST' })
  }
}

