(function() {
  function noop() {}

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

  // fullscreen
  window.AndroidFullScreen = {};
  window.AndroidFullScreen.showSystemUI = noop;
  window.AndroidFullScreen.immersiveMode = noop;

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
      setTimeout(() => {
        var consent = JSON.parse(localStorage.getItem('__onesignalConsent'))
        callback(consent)
      })
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
