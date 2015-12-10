import session from './session';
import m from 'mithril';

const variantID = window.lichess.aerogearVariantID;
const variantSecret = window.lichess.aerogearVariantSecret;

function xhrConfig(xhr) {
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(variantID + ':' + variantSecret));
}

export default {
  init() {
    console.log('push init');
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
        console.log('registration to: ', window.lichess.aerogearEndPoint + 'rest/registry/device');
        m.request({
          url: window.lichess.aerogearEndPoint + 'rest/registry/device',
          method: 'POST',
          config: xhrConfig,
          data: {
            deviceToken: data.registrationId,
            alias: session.get().username,
            categories: ['move', 'gameEnd']
          }
        })
        .then(succ => {
          console.log(succ);
        }, err => {
          console.log(err);
        });
      }
    });

    push.on('notification', function(data) {
      window.plugins.toast.show(data.message, 'short', 'center');
      console.log(data);
    });
  }
};
