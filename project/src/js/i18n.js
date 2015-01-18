var messages = [];

var untranslated = {
  human: 'Human',
  computer: 'Computer',
  notConnected: 'Not connected',
  connectionError: 'Connection error',
  noInternetConnection: 'No internet connection',
  unauthorizedError: 'Access is unauthorized',
  lichessIsNotReachableError: 'lichess.org is unreachable',
  apiUnsupported: 'You\'re using an unsupported api version. The application may not work at all. Upgrade the application to fix this issue.',
  apiDeprecated: 'You\'re using a deprecated api version. Support will drop on %s. You should upgrade.',
  resourceNotFoundError: 'Resource not found',
  lichessIsUnavailableError: 'lichess.org is temporarily down for maintenance',
  color: 'Color',
  clock: 'Clock',
  showCoordinates: 'Show board coordinates',
  animations: 'Pieces animations',
  loginSuccessfull: 'Login successful',
  resumeGame: 'Resume game',
  dataRefreshSuccessful: 'Successfully refreshed session data',
  pieceDestinations: 'Show/hide piece destinations'
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

function loadPreferredLanguage(callback) {
  window.navigator.globalization.getPreferredLanguage(
    function(language) {
      loadFile(language.value.split('-')[0], callback);
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
