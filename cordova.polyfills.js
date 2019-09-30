(function() {
  function noop() {}

  window.cordova = {};
  window.cordova.plugins = {};
  window.plugins = {};

  // push
  function oneSignalInit() {
    return OneSignalConf;
  }
  var OneSignalConf = {
    handleNotificationOpened: oneSignalInit,
    handleNotificationReceived: oneSignalInit,
    inFocusDisplaying: oneSignalInit,
    endInit: oneSignalInit
  };

  window.plugins.OneSignal = {
    startInit: oneSignalInit,
    getIds: noop,
    enableSound: noop,
    enableVibrate: noop,
    setRequiresUserPrivacyConsent: noop,
    provideUserConsent(bool) {
      localStorage.setItem('__onesignalConsent', bool);
    },
    userProvidedPrivacyConsent(callback) {
      setTimeout(callback(JSON.parse(localStorage.getItem('__onesignalConsent'))));
    },
    OSInFocusDisplayOption: {
      None: 1
    }
  };

  // insomnia
  window.plugins.insomnia = {};
  window.plugins.insomnia.allowSleepAgain = noop;
  window.plugins.insomnia.keepAwake = noop;

  window.plugins.webViewChecker = {
    getCurrentWebViewPackageInfo: function() {
      return Promise.resolve({
        packageName: 'com.android.chrome',
        versionName: '69.0.3497.100',
        versionCode: 349710065,
      })
    },
    openGooglePlayPage: noop
  }

}());

if (!window.Stockfish) {
  // cordova-stockfish-plugin interface
  var stockfishWorker;
  window.Stockfish = {
    init: function() {
      return new Promise(function(resolve) {
        if (stockfishWorker) {
          setTimeout(resolve);
        } else {
          stockfishWorker = new Worker('../stockfish.js');
          setTimeout(resolve, 10);
        }
      });
    },
    cmd: function(cmd) {
      return new Promise(function(resolve) {
        if (stockfishWorker) stockfishWorker.postMessage(cmd);
        setTimeout(resolve, 1);
      });
    },
    output: function(callback) {
      if (stockfishWorker) {
        stockfishWorker.onmessage = msg => {
          callback(msg.data);
        };
      }
    },
    exit: function() {
      return new Promise(function(resolve) {
        if (stockfishWorker) {
          stockfishWorker.terminate();
          stockfishWorker = null;
        }
        setTimeout(resolve, 1);
      });
    }
  };
}

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

    mute: function(ismute, success) {
      for (var id in this.res_cache) {
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
        hotjs.Audio.mute = function() {};
      }
    } else {
      hotjs.Audio = html5_audio;
    }

    hotjs.Audio.preloadFXBatch = function(fx_mapping) {
      for (var k in fx_mapping) {
        this.preloadFX(k, fx_mapping[k]);
      }
    };
    hotjs.Audio.unloadFXBatch = function(fx_mapping) {
      for (var k in fx_mapping) {
        this.unload(k);
      }
    };

    hotjs.Audio.init = initHotjsAudio;
  };

  hotjs.Audio.init = initHotjsAudio;

  window.hotjs = hotjs;

})();
