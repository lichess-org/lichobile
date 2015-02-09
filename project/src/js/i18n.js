var messages = [];

var untranslated = {
  apiUnsupported: 'Your version of lichess app is too old! Please upgrade for free to the latest version.',
  apiDeprecated: 'Upgrade for free to the latest lichess app! Support for this version will be dropped on %s.',
  appUpgradeAvailable: 'A new version of lichess mobile is available!',
  resourceNotFoundError: 'Resource not found',
  lichessIsUnavailableError: 'lichess.org is temporarily down for maintenance'
};

var defaultCode = 'en';

function loadFile(code, callback) {
  m.request({
    url: 'i18n/' + code + '.json',
    method: 'GET'
  }).then(function(data) {
    messages = data;
    callback();
  }, function(error) {
    // workaround for iOS: because xhr for local file has a 0 status it will
    // reject the promise, but still have the response object
    if (error && error.playWithAFriend) {
      messages = error;
      callback();
    } else {
      if (code === defaultCode) throw new Error(error);
      console.log(error, 'defaulting to ' + defaultCode);
      loadFile(defaultCode, callback);
    }
  });
}

function loadMomentLocal(code) {
  if (code === 'en') return;
  var script = document.createElement('script');
  script.src = 'moment/locale/' + code + '.js';
  document.head.appendChild(script);
  window.moment.locale(code);
}

function loadPreferredLanguage(callback) {
  window.navigator.globalization.getPreferredLanguage(
    function(language) {
      var code = language.value.split('-')[0];
      loadFile(code, callback);
      loadMomentLocal(code);
    },
    function() {
      loadFile(defaultCode, callback);
    });
}

module.exports = function(key) {
  var str = messages[key] || untranslated[key] || key;
  Array.prototype.slice.call(arguments, 1).forEach(function(arg) {
    str = str.replace('%s', arg);
  });
  return str;
};
module.exports.loadPreferredLanguage = loadPreferredLanguage;
