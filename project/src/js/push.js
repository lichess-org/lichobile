import session from './session';
import m from 'mithril';

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
        register(
          window.lichess.aerogearEndPoint,
          window.lichess.aerogearVariantID,
          window.lichess.aerogearVariantSecret,
          data.registrationId,
          session.get().userName
        );
      }
    });

    push.on('notification', function(data) {
      window.plugins.toast.show(data.message, 'short', 'center');
      console.log(data);
    });
  }
};

function register(endPoint, variantId, variantSecret, registrationId, userName) {

  console.log('registration to: ', endPoint + 'rest/registry/device');
  console.log(variantId, variantSecret);
  console.log(registrationId);

  function xhrConfig(xhr) {
    xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(variantId + ':' + variantSecret));
  }

  m.request({
    url: endPoint + 'rest/registry/device',
    method: 'POST',
    config: xhrConfig,
    data: {
      deviceToken: registrationId,
      alias: userName,
      categories: ['move', 'gameEnd']
    }
  })
  .then(succ => {
    console.log(succ);
  }, err => {
    console.log(err);
  });
}
