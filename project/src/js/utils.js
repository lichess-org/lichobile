var utils = {};
var i18n = require('./i18n');

utils.hasNetwork = function() {
  var t = window.navigator.connection.type;
  return t !== window.Connection.NONE && t !== window.Connection.UNKNOWN;
};

/*
 * Util function to handle xhr errors per request. We don't want to show alerts
 * for every request, this is why it's not done in the extract function of
 * m.request.
 *
 * @param {Error} error The error thrown in extract function (see http.js)
 */
utils.handleXhrError = function(error) {
  if (!utils.hasNetwork())
    window.navigator.notification.alert(i18n('noInternetConnection'));
  else
    window.plugins.toast.show(i18n(error.message), 'short', 'center');
};

utils.lichessSri = Math.random().toString(36).substring(2);

utils.serializeQueryParameters = function(obj) {
  var str = '';
  for (var key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += key + '=' + obj[key];
  }
  return str;
};

function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

utils.partialf = function() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
};

utils.f = function() {
  var args = arguments,
    fn = arguments[0];
  return function() {
    fn.apply(fn, Array.prototype.slice.call(args, 1));
  };
};

utils.noop = function() {};

utils.playerName = function(player, withRating) {
  if (player.username || player.user) {
    var name = player.username || player.user.username;
    if (player.user && player.user.title) name = player.user.title + ' ' + name;
    if (withRating && (player.user || player.rating)) name += ' (' + (player.rating || player.user.rating) + ')';
    return name;
  }
  if (player.ai)
    return i18n('aiNameLevelAiLevel', 'Stockfish', player.ai);
  return 'Anonymous';
};

utils.backHistory = function() {
  if (window.navigator.app && window.navigator.app.backHistory)
    window.navigator.app.backHistory();
  else
    window.history.go(-1);
};

var perfIconsMap = {
  bullet: 'T',
  blitz: ')',
  classical: '+',
  correspondence: ';',
  chess960: '\'',
  kingOfTheHill: '(',
  threeCheck: '.',
  antichess: '@',
  atomic: '>',
  puzzle: '-',
  horde: '_'
};

utils.gameIcon = function(perf) {
  return perfIconsMap[perf];
};

utils.secondsToMinutes = function(sec) {
  return sec === 0 ? sec : sec / 60;
};

utils.tupleOf = function(x) {
  return [x.toString(), x.toString()];
};

utils.oppositeColor = function(color) {
  return color === 'white' ? 'black' : 'white';
};

utils.caseInsensitiveSort = function(a, b) {
  var alow = a.toLowerCase();
  var blow = b.toLowerCase();

  return alow > blow ? 1: (alow < blow ? -1 : 0);
};

utils.userFullNameToId = function(fullName) {
  var split = fullName.split(' ');
  var id = split.length === 1 ? split[0] : split[1];
  return id.toLowerCase();
};

module.exports = utils;
