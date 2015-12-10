(function() {
  function noop() {}

  window.cordova = {};
  window.cordova.plugins = {};
  window.plugins = {};

  window.cordova.platformId = 'browser';

  // analytics
  window.analytics = {
    startTrackerWithId: noop,
    trackException: noop,
    trackView: noop
  };

  // push
  window.PushNotification = {
    init: function() {
      return {
        on: noop,
        off: noop,
        unregister: noop,
        finish: noop
      };
    }
  };

  // events
  document.addEventListener('DOMContentLoaded', function() {
    document.dispatchEvent(new window.Event('deviceready'));
  }, false);

  // backbutton emulation
  window.backbutton = function() {
    document.dispatchEvent(new window.Event('backbutton'));
  };

  // keyboard
  window.cordova.plugins.Keyboard = {
    show: noop,
    close: noop,
    disableScroll: noop,
    hideKeyboardAccessoryBar: noop
  };

  // social sharing
  window.plugins.socialsharing = {
    share: function(message, subject, image, link) {
      if (message) console.log('Text share widget opened with text: ', message);
      if (link) console.log('Link share widget opened with link: ', link);
    }
  };

  // toast
  function mockToast() {
    console.log('Toast fired with args:', arguments);
  }
  window.plugins.toast = {
    show: mockToast,
    showShortTop: mockToast,
    showShortCenter: mockToast,
    showShortBottom: mockToast,
    showLongTop: mockToast,
    showLongCenter: mockToast,
    showLongBottom: mockToast
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
        value: 'en'
      });
    }
  };

}());


/**
 * https://github.com/floatinghotpot/cordova-plugin-lowlatencyaudio polyfill
 *
 * Created by liming on 14-7-18.
 */


(function() {

  var hotjs = {};

  var html5_audio = {
    // id -> obj mapping
    res_cache: {},

    preloadFX: function(id, assetPath, success, fail) {
      var res = new Audio();
      res.addEventListener('canplaythrough', success, false);
      res.onerror = fail;
      res.setAttribute('src', assetPath);
      res.load();
      this.res_cache[id] = res;
    },

    preloadAudio: function(id, assetPath, volume, voices, success, fail) {
      var res = new Audio();
      res.addEventListener('canplaythrough', success, false);
      res.onerror = fail;
      res.setAttribute('src', assetPath);
      res.load();
      res.volume = volume;
      this.res_cache[id] = res;
    },

    play: function(id, success, fail) {
      var res = this.res_cache[id];
      if (typeof res === 'object') {
        res.play();
        if (typeof success === 'function') success();
      } else {
        if (typeof fail === 'function') fail();
      }
    },

    mute: function(ismute, success, fail) {
      for (id in this.res_cache) {
        var res = this.res_cache[id];
        if (typeof res === 'object') res.muted = ismute;
      }
      if (typeof success === 'function') success();
    },

    loop: function(id, success, fail) {
      var res = this.res_cache[id];
      if (typeof res === 'object') {
        res.loop = true;
        res.play();
        if (typeof success === 'function') success();
      } else {
        if (typeof fail === 'function') fail();
      }
    },
    stop: function(id, success, fail) {
      var res = this.res_cache[id];
      if (typeof res === 'object') {
        res.pause();
        if (res.currentTime) res.currentTime = 0;
        if (typeof success === 'function') success();
      } else {
        if (typeof fail === 'function') fail();
      }
    },
    unload: function(id, success, fail) {
      var res = this.res_cache[id];
      if (typeof res === 'object') {
        delete this.res_cache[id];
        if (typeof success === 'function') success();
      } else {
        if (typeof fail === 'function') fail();
      }
    }
  };

  hotjs.Audio = hotjs.Audio || {};

  var initHotjsAudio = function() {
    if (window.plugins && window.plugins.LowLatencyAudio) {
      hotjs.Audio = window.plugins.LowLatencyAudio;
      if (typeof hotjs.Audio.mute !== 'function') {
        hotjs.Audio.mute = function(ismute, success, fail) {};
      }
    } else {
      hotjs.Audio = html5_audio;
    }

    hotjs.Audio.preloadFXBatch = function(fx_mapping, success, fail) {
      for (var k in fx_mapping) {
        this.preloadFX(k, fx_mapping[k]);
      }
    };
    hotjs.Audio.unloadFXBatch = function(fx_mapping, success, fail) {
      for (var k in fx_mapping) {
        this.unload(k);
      }
    };

    hotjs.Audio.init = initHotjsAudio;
  };

  hotjs.Audio.init = initHotjsAudio;

  window.hotjs = hotjs;

})();
