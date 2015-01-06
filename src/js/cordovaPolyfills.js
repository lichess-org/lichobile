function noop() {}

// global objects
window.cordova = {};
window.cordova.plugins = {};
window.plugins = {};

// events
var deviceReadyEvent = new window.Event('deviceready');
document.addEventListener('DOMContentLoaded', function() {
  document.dispatchEvent(deviceReadyEvent);
}, false);

// keyboard
window.cordova.plugins.Keyboard = {
  show: noop,
  close: noop,
  disableScroll: noop,
  hideKeyboardAccessoryBar: noop
};

// insomnia
window.plugins.insomnia = {};
window.plugins.insomnia.allowSleepAgain = noop;
window.plugins.insomnia.keepAwake = noop;

// device
window.device = {
  cordova: 'browser',
  model: 'browser',
  platform: 'browser',
  uuid: 'browser',
  version: 'browser'
};

// network information
window.Connection = {};
window.navigator.connection = {};
window.navigator.connection.type = 1;

// notification
window.navigator.notification = {};
window.navigator.notification.alert = window.alert.bind(window);
window.navigator.notification.confirm = window.confirm.bind(window);
window.navigator.notification.prompt = window.prompt.bind(window);
window.navigator.notification.beep = noop;

// splashscreen
window.navigator.splashscreen = {};
window.navigator.splashscreen.hide = noop;

// globalization
window.navigator.globalization = {
  getPreferredLanguage: function(success) {
    success({
      value: 'fr-FR'
    });
  }
};
