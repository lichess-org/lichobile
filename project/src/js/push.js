import session from './session';
import settings from './settings';
import { request } from './http';
import m from 'mithril';

let push;

export default {
  register() {

    if (settings.general.notifications()) {

      push = window.PushNotification.init({
        android: {
          senderID: window.lichess.gcmSenderId,
          sound: true
        },
        ios: {
          sound: true,
          alert: true,
          badge: true
        }
      });

      push.on('registration', function(data) {
        if (session.isConnected()) {
          // we won't try to register again on failure for now
          const platform = window.cordova.platformId;
          const deviceId = encodeURIComponent(data.registrationId);
          request(`/mobile/register/${platform}/${deviceId}`, {
            method: 'POST',
            deserialize: v => v
          });
        }
      });

      push.on('notification', function(data) {
        // if app was foreground we don't want to disturb too much so we'll
        // just refresh nb of turns in board icon
        if (data.additionalData && data.additionalData.foreground) {
          // TODO don't refresh but use payload to modify game data
          session.refresh();
        }
        // if background we go to the game
        else if (data.additionalData && data.additionalData.userData) {
          m.route(`/game/${data.additionalData.userData.fullId}`);
        }
      });

    }
  },

  unregister() {
    if (push) {
      push.unregister(function() {
        request('/mobile/unregister', {
          method: 'POST',
          deserialize: v => v
        }).then(() => push = null);
      }, console.log.bind(console));
    }
  }
};

