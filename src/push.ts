import settings from './settings'
import session from './session'
import router from './router'
import challengesApi from './lichess/challenges'
import { fetchText } from './http'

interface Payload {
  title: string
  body: string
  additionalData: any
}

interface NotificationReceivedData {
  isAppInFocus: boolean
  payload: Payload
}

interface NotificationOpenedData {
  isAppInFocus: boolean
  notification: {
    payload: Payload
  }
}

export default {
  register() {

    if (settings.general.notifications.allow()) {
      window.plugins.OneSignal
      .startInit('2d12e964-92b6-444e-9327-5b2e9a419f4c')
      .handleNotificationOpened(notificationOpenedCallback)
      .handleNotificationReceived(notificationReceivedCallback)
      .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
      .endInit()

      window.plugins.OneSignal.getIds(({ userId }) => {
        fetchText(`/mobile/register/onesignal/${userId}`, {
          method: 'POST'
        })
      })

      window.plugins.OneSignal.enableVibrate(settings.general.notifications.vibrate())
      window.plugins.OneSignal.enableSound(settings.general.notifications.sound())
    }
  },

  unregister() {
    fetchText('/mobile/unregister', { method: 'POST' })
  }
}

function notificationReceivedCallback(data: NotificationReceivedData) {
  const additionalData = data.payload.additionalData
  if (additionalData && additionalData.userData) {
    if (data.isAppInFocus) {
      switch (additionalData.userData.type) {
        case 'challengeAccept':
          sendLocalNotif(
            data.payload.title,
            data.payload.body,
            `/game/${additionalData.userData.challengeId}`
          )
          break
        case 'corresAlarm':
        case 'gameTakebackOffer':
        case 'gameDrawOffer':
        case 'gameFinish':
          sendLocalNotif(
            data.payload.title,
            data.payload.body,
            `/game/${additionalData.userData.fullId}`
          )
          break
        case 'gameMove':
          session.refresh()
          sendLocalNotif(
            data.payload.title,
            data.payload.body,
            `/game/${additionalData.userData.fullId}`
          )
          break
        case 'newMessage':
          sendLocalNotif(
            data.payload.title,
            data.payload.body,
            `/inbox/${additionalData.userData.threadId}`
          )
          break
      }
    }
  }
}

function notificationOpenedCallback(data: NotificationOpenedData) {
  const additionalData = data.notification.payload.additionalData
  if (additionalData && additionalData.userData) {
    if (!data.isAppInFocus) {
      switch (additionalData.userData.type) {
        case 'challengeAccept':
          challengesApi.refresh()
          router.set(`/game/${additionalData.userData.challengeId}`)
          break
        case 'challengeCreate':
          router.set(`/challenge/${additionalData.userData.challengeId}`)
          break
        case 'corresAlarm':
        case 'gameMove':
        case 'gameFinish':
        case 'gameTakebackOffer':
        case 'gameDrawOffer':
          router.set(`/game/${additionalData.userData.fullId}`)
          break
        case 'newMessage':
          router.set(`/inbox/${additionalData.userData.threadId}`)
          break
      }
    }
  }
}

function sendLocalNotif(title: string, text: string, route: string) {
  // for important pushs, we still want to display them as a notification
  // push received on ios is always shown; on android it's only when app in
  // background
  if (cordova.platformId === 'android' && !router.get().startsWith(route)) {
    window.cordova.plugins.notification.local.schedule({
      title,
      text,
      at: Date.now(),
      icon: 'res://icon',
      smallIcon: 'res://ic_stat_onesignal_default',
      data: {
        notifType: 'route',
        route
      }
    })
  }
}
