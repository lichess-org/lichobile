import {
  Capacitor,
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core'
import { fetchText } from './http'
import challengesApi from './lichess/challenges'
import router from './router'
import session from './session'
import settings from './settings'
import { handleXhrError } from './utils'
import { isForeground } from './utils/appMode'

const { PushNotifications } = Plugins

export default {
  init() {
    PushNotifications.addListener('registration',
      ({ value }: PushNotificationToken) => {
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
      (notification: PushNotification) => {
        if (isForeground()) {
          switch (notification.data['lichess.type']) {
            case 'corresAlarm':
            case 'gameTakebackOffer':
            case 'gameDrawOffer':
              session.refresh()
              break
            case 'challengeAccept':
            case 'gameMove':
            case 'gameFinish':
              session.refresh()
              .then(() => {
                if (Capacitor.platform === 'ios') {
                  Plugins.Badge.setNumber({ badge: session.myTurnGames().length })
                }
              })
              break
          }
        }
      }
    )

    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: PushNotificationActionPerformed) => {
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

  register(): Promise<void> {
    if (settings.general.notifications.allow()) {
      PushNotifications.requestPermission().then(result => {
        if (result.granted) {
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

