import * as h from 'mithril/hyperscript'
import settings from './settings'
import session from './session'
import router from './router'
import challengesApi from './lichess/challenges'
import { noop } from './utils'
import promptDialog from './prompt'
import { fetchText } from './http'
import * as helper from './ui/helper'

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
  init() {
    // will delay initialization of the SDK until the user provides consent
    window.plugins.OneSignal.setRequiresUserPrivacyConsent(true)

    window.plugins.OneSignal
    .startInit('2d12e964-92b6-444e-9327-5b2e9a419f4c')
    .handleNotificationOpened(notificationOpenedCallback)
    .handleNotificationReceived(notificationReceivedCallback)
    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
    .endInit()

    window.plugins.OneSignal.enableVibrate(settings.general.notifications.vibrate())
    window.plugins.OneSignal.enableSound(settings.general.notifications.sound())
  },

  showConsentDialog,
  provideUserConsent,

  register,

  unregister(): Promise<string> {
    return fetchText('/mobile/unregister', { method: 'POST' })
  }
}

function provideUserConsent(consent: boolean): void {
  window.plugins.OneSignal.provideUserConsent(consent)
}

function showConsentDialog(): Promise<void> {
  return new Promise((resolve, reject) => {
    const content = h('div', [
      h('p', 'Push notifications are provided to you by a third party service that, when enabled, automatically collect application usage data.'),
      h('p', [
        'To learn more about this, you can read the ',
        h('a[href=#]', {
          oncreate: helper.ontap(() => {
            window.open('https://lichess.org/privacy', '_system')
          })
        }, 'privacy policy.')
      ]),
      h('p', 'Would you like to use push notifications and allow to share these informations with this third-party service?'),
      h('p', 'You can change this choice any time on the settings screen.'),
      h('br'),
      h('div.buttons', [
        h('button', {
          oncreate: helper.ontap(() => {
            settings.general.notifications.allow(true)
            provideUserConsent(true)
            promptDialog.hide()
            resolve()
          })
        }, 'Yes'),
        h('button', {
          oncreate: helper.ontap(() => {
            settings.general.notifications.allow(false)
            provideUserConsent(false)
            promptDialog.hide()
            reject()
          })
        }, 'No'),
      ])
    ])
    promptDialog.show(content, 'Consent required')
  })
}

function register() {
  window.plugins.OneSignal.userProvidedPrivacyConsent((providedConsent: boolean) => {
    const allowed = settings.general.notifications.allow()
    if (providedConsent && allowed) {
      window.plugins.OneSignal.getIds(({ userId }) => {
        fetchText(`/mobile/register/onesignal/${userId}`, {
          method: 'POST'
        })
      })
    } else if (!providedConsent && allowed) {
      showConsentDialog().catch(noop)
    }
  })
}

function notificationReceivedCallback(data: NotificationReceivedData) {
  const additionalData = data.payload.additionalData
  if (additionalData && additionalData.userData) {
    if (data.isAppInFocus) {
      switch (additionalData.userData.type) {
        case 'challengeAccept':
          session.refresh()
          break
        case 'corresAlarm':
        case 'gameTakebackOffer':
        case 'gameDrawOffer':
        case 'gameFinish':
          session.refresh()
          break
        case 'gameMove':
          session.refresh()
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
