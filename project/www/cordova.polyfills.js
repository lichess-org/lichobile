(function() {
  function noop() {}

  window.cordova = {};
  window.cordova.plugins = {};
  window.plugins = {};

  window.cordova.platformId = 'browser';

  // analytics
  window.analytics = {
    startTrackerWithId: noop,
    trackView: noop,
  };

  // events
  document.addEventListener('DOMContentLoaded', function() {
    document.dispatchEvent(new window.Event('deviceready'));
  }, false);

  // keyboard
  window.cordova.plugins.Keyboard = {
    show: noop,
    close: noop,
    disableScroll: noop,
    hideKeyboardAccessoryBar: noop
  };

  // toast
  window.plugins.toast = {
    show: noop,
    showShortTop: noop,
    showShortCenter: noop,
    showShortBottom: noop,
    showLongTop: noop,
    showLongCenter: noop,
    showLongBottom: noop
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
  window.Connection = {
    NONE: "none",
    UNKNOWN: "unknown",
    WIFI: "wifi",
    ETHERNET: "ethernet",
    CELL_2G: "2g",
    CELL_3G: "3g",
    CELL_4G: "4g",
    CELL: "cellular"
  };
  window.navigator.connection = {
    type: "wifi"
  };

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

  window.Media = window.Audio;
}());
