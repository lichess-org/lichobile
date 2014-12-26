var m = require('mithril');

var messages = [];

var defaultCode = 'en';

function loadPreferredLanguage(callback) {
  navigator.globalization.getPreferredLanguage(
    function(language) {
      loadFile(language.value.split('-')[0], callback);
    },
    function(error) {
      loadFile('en', callback);
    });
};

function loadFile(code, callback) {
  var i18nLoc = window.cordova ? (window.device.platform === 'Android' ? '/android_asset/www/i18n' : 'i18n') : 'i18n';
  m.request({
    url: i18nLoc + '/' + code + '.json',
    method: 'GET'
  }).then(function(data) {
    var messages = data;
    callback();
  }, function(error) {
    if (code == defaultCode) throw error;
    console.log(error, 'defaulting to ' + defaultCode);
    loadFile(defaultCode, callback);
  });
}

module.exports = function(str) {
  str = messages[arguments[0]];
  Array.prototype.slice.call(arguments, 1).forEach(function(arg) {
    str = str.replace('%s', arg);
  });
  return str;
};
module.exports.loadPreferredLanguage = loadPreferredLanguage;
