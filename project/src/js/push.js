import i18n from './i18n';
import { lightPlayerName } from './utils';
import settings from './settings';
import session from './session';
import router from './router';
import challengesApi from './lichess/challenges';
import { fetchText } from './http';

function notificationOpenedCallback({ additionalData, isActive }) {
  if (additionalData.userData) {
    if (isActive) {
      switch (additionalData.userData.type) {
        case 'challengeAccept':
          session.refresh();
          window.plugins.toast.show(
            i18n('userAcceptsYourChallenge', lightPlayerName(additionalData.userData.joiner)), 'long', 'top');
          break;
        case 'gameMove':
        case 'gameFinish':
          session.refresh();
          break;
      }
    } else {
      switch (additionalData.userData.type) {
        case 'challengeCreate':
          router.set(`/challenge/${additionalData.userData.challengeId}`);
          break;
        case 'challengeAccept':
          challengesApi.refresh();
          router.set(`/game/${additionalData.userData.challengeId}`);
          break;
        case 'gameMove':
          router.set(`/game/${additionalData.userData.fullId}`);
          break;
        case 'gameFinish':
          router.set(`/game/${additionalData.userData.fullId}`);
          break;
      }
    }
  }
}

export default {
  register() {

    if (settings.general.notifications.allow()) {

      window.plugins.OneSignal.init(
        '2d12e964-92b6-444e-9327-5b2e9a419f4c',
        {googleProjectNumber: '1050901934956'},
        notificationOpenedCallback
      );

      window.plugins.OneSignal.getIds(({ userId }) => {
        fetchText(`/mobile/register/onesignal/${userId}`, {
          method: 'POST'
        });
      });

      window.plugins.OneSignal.enableInAppAlertNotification(false);
    }
  },

  unregister() {
    fetchText('/mobile/unregister', { method: 'POST' });
  }
};
