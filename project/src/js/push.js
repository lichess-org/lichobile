import session from './session';
import { request } from './http';
import m from 'mithril';

export default {
  init() {

    const push = window.PushNotification.init({
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
        request(`/mobile/register/${platform}/${deviceId}`);
      }
    });

    push.on('notification', function(data) {
      console.log(data);
      // if app was foreground we don't want to disturb too much so we'll
      // just refresh nb of turns in board icon
      if (data.additionalData.foreground) {
        session.refresh();
      }
      // if background we go to the game
      else {
        if (data.additionalData && data.additionalData.userData) {
          // should we have fullId here?
          m.route(`/game/${data.additionalData.userData.gameId}`);
        }
      }
    });
  }
};

