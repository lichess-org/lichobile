import session from './session';
import settings from './settings';
import { request } from './http';
import { getChallenges, timeline as getTimeline } from './xhr';
import challengesApi from './lichess/challenges';
import timeline from './lichess/timeline';
import m from 'mithril';

let push;

export default {
  register() {

    if (window.cordova.platformId === 'android' && settings.general.notifications()) {

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
        const payload = data.additionalData;
        if (payload) {
          if (payload.foreground) {
            // if foreground just refresh according data
            if (payload.userData) {
              switch (payload.userData.type) {
                case 'challengeCreate':
                case 'challengeAccept':
                case 'challengeDecline':
                  getChallenges().then(challengesApi.set);
                  break;
                case 'gameMove':
                  session.refresh();
                  break;
                case 'gameFinish':
                  session.refresh();
                  timeline.refresh();
                  break;
              }
            }
          }
          // if background we go to the game or challenge
          else if (payload.userData) {
            switch (payload.userData.type) {
              case 'challengeCreate':
              case 'challengeAccept':
                m.route(`/challenge/${payload.userData.challengeId}`);
                break;
              case 'gameMove':
                m.route(`/game/${payload.userData.fullId}`);
                break;
              case 'gameFinish':
                getTimeline().then(t => {
                  timeline.set(t);
                  // if only one unread, assume it's the notif and set it as
                  // already read
                  if (timeline.unreadCount() === 1) {
                    timeline.setLastReadTimestamp();
                  }
                });
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
        }).then(() => push = null);
      }, console.log.bind(console));
    }
  }
};

