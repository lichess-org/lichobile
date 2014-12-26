function noop() {}

// insomnia
window.plugins = {};
window.plugins.insomnia = {};
window.plugins.insomnia.allowSleepAgain = noop;
window.plugins.insomnia.keepAwake = noop;

// network information
window.Connection = {};
window.navigator.connection = {};
window.navigator.connection.type = 1;

// notification
window.navigator.notification = {};
window.navigator.notification.alert = window.alert;
window.navigator.notification.confirm = window.confirm;
window.navigator.notification.prompt = window.prompt;
window.navigator.notification.beep = noop;

// splashscreen
window.navigator.splashscreen = {};
window.navigator.splashscreen.hide = noop;

// globalization
window.navigator.globalization = {
  getPreferredLanguage: function(success, error) {
    success({
      value: 'fr-FR'
    });
  }
};
