import session from './session';
import { request } from './http';

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
      if (session.isConnected())
        request(`/push-register/${data.registrationId}`);
    });
  }
};
