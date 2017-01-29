import i18n from './i18n';
import { lightPlayerName } from './utils';
import settings from './settings';
import session from './session';
import router from './router';
import challengesApi from './lichess/challenges';
import { fetchText } from './http';

interface NotificationReceivedData {
  isAppInFocus: boolean
  payload: {
    additionalData: any
  }
}

interface NotificationOpenedData {
  isAppInFocus: boolean
  notification: {
    payload: {
      additionalData: any
    }
  }
}

function notificationReceivedCallback(data: NotificationReceivedData) {
  const additionalData = data.payload.additionalData;
  if (additionalData && additionalData.userData) {
    if (data.isAppInFocus) {
      switch (additionalData.userData.type) {
        case 'challengeAccept':
          session.refresh();
          window.plugins.toast.show(
            i18n('userAcceptsYourChallenge', lightPlayerName(additionalData.userData.joiner)), 'long', 'top');
          break;
        case 'corresAlarm':
          break;
        case 'gameMove':
        case 'gameFinish':
          session.refresh();
          break;
        case 'newMessage':
          window.plugins.toast.show(
            'New message from ' + lightPlayerName(additionalData.userData.sender), 'long', 'top');
          break;
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
          challengesApi.refresh();
          router.set(`/game/${additionalData.userData.challengeId}`);
          break;
        case 'challengeCreate':
          router.set(`/challenge/${additionalData.userData.challengeId}`);
          break;
        case 'corresAlarm':
          router.set(`/game/${additionalData.userData.fullId}`);
          break;
        case 'gameMove':
          router.set(`/game/${additionalData.userData.fullId}`);
          break;
        case 'gameFinish':
          router.set(`/game/${additionalData.userData.fullId}`);
          break;
        case 'newMessage':
          router.set(`/inbox/${additionalData.userData.threadId}`);
          break;
      }
    }
  }
}

export default {
  register() {

    if (settings.general.notifications.allow()) {
      window.plugins.OneSignal
      .startInit('2d12e964-92b6-444e-9327-5b2e9a419f4c', window.lichess.gcmSenderId)
      .handleNotificationOpened(notificationOpenedCallback)
      .handleNotificationReceived(notificationReceivedCallback)
      .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
      .endInit();

      window.plugins.OneSignal.getIds(({ userId }) => {
        fetchText(`/mobile/register/onesignal/${userId}`, {
          method: 'POST'
        });
      });

      window.plugins.OneSignal.enableVibrate(settings.general.notifications.vibrate());
      window.plugins.OneSignal.enableSound(settings.general.notifications.sound());
    }
  },

  unregister() {
    fetchText('/mobile/unregister', { method: 'POST' });
  }
};
