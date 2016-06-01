import session from './session';
import settings from './settings';
import i18n from './i18n';
import { lightPlayerName } from './utils';
import { request } from './http';
import challengesApi from './lichess/challenges';
import m from 'mithril';

let push;

export default {
  register() {

    if (window.cordova.platformId === 'android' && settings.general.notifications.allow()) {

      push = window.PushNotification.init({
        android: {
          senderID: window.lichess.gcmSenderId,
          sound: settings.general.notifications.sound(),
          vibrate: settings.general.notifications.vibrate(),
          clearNotifications: true
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
        const payload = data.additionalData;
        if (payload) {
          if (payload.foreground) {
            // if foreground just refresh according data
            if (payload.userData) {
              switch (payload.userData.type) {
                case 'challengeCreate':
                  challengesApi.refresh().then(() => m.redraw());
                  break;
                case 'challengeAccept':
                  Promise.all([
                    challengesApi.refresh(),
                    session.refresh()
                  ])
                  .then(() => {
                    window.plugins.toast.show(
                      i18n('userAcceptsYourChallenge', lightPlayerName(payload.userData.joiner)), 'long', 'top');
                    m.redraw();
                  });
                  break;
                case 'gameMove':
                  session.refresh().then(v => {
                    if (v) m.redraw();
                  });
                  break;
                case 'gameFinish':
                  session.refresh()
                  .then(() => m.redraw());
                  break;
              }
            }
          }
          // if background we go to the game or challenge
          else if (payload.userData) {
            switch (payload.userData.type) {
              case 'challengeCreate':
                m.route(`/challenge/${payload.userData.challengeId}`);
                break;
              case 'challengeAccept':
                challengesApi.refresh();
                m.route(`/game/${payload.userData.challengeId}`);
                break;
              case 'gameMove':
                m.route(`/game/${payload.userData.fullId}`);
                break;
              case 'gameFinish':
                m.route(`/game/${payload.userData.fullId}`);
                break;
            }
          }
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
        }).then(() => {
          push = null;
        });

      }, console.log.bind(console));
    }
  }
};

