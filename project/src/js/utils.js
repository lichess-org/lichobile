import i18n from './i18n';
import m from 'mithril';

export function autoredraw(action) {
  m.startComputation();
  action();
  m.endComputation();
}

export function hasNetwork() {
  return window.navigator.connection.type !== window.Connection.NONE;
}

export function handleXhrError(error) {
  var {response: data, status} = error;
  if (!hasNetwork()) {
    window.plugins.toast.show(i18n('noInternetConnection'), 'short', 'center');
  } else {
    let message;
    if (!status || status === 0)
      message = 'noInternetConnection';
    else if (status === 401)
      message = 'unauthorizedError';
    else if (status === 404)
      message = 'resourceNotFoundError';
    else if (status === 503)
      message = 'lichessIsUnavailableError';
    else if (status >= 500)
      message = 'Server error';
    else
      message = 'Error';

    message = i18n(message);

    if (typeof data === 'string') message += ` ${data}`;
    else if (data.global && data.global.constructor === Array) message += ` ${data.global[0]}`;
    else if (typeof data.error === 'string') message += ` ${data.error}`;

    window.plugins.toast.show(message, 'short', 'center');
  }
}

export function serializeQueryParameters(obj) {
  var str = '';
  for (var key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += key + '=' + obj[key];
  }
  return str;
}

function partialApply(fn, args) {
  return fn.bind.apply(fn, [null].concat(args));
}

export function partialf() {
  return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
}

export function f() {
  var args = arguments,
    fn = arguments[0];
  return function() {
    fn.apply(fn, Array.prototype.slice.call(args, 1));
  };
}

export function noop() {}

export function playerName(player, withRating) {
  if (player.username || player.user) {
    var name = player.username || player.user.username;
    if (player.user && player.user.title) name = player.user.title + ' ' + name;
    if (withRating && (player.user || player.rating)) {
      name += ' (' + (player.rating || player.user.rating);
      if (player.provisional) name += '?';
      name += ')';
    }
    return name;
  }
  if (player.ai)
    return aiName(player.ai);
  return 'Anonymous';
}

export function aiName(level) {
  return i18n('aiNameLevelAiLevel', 'Stockfish', level);
}

export function backHistory() {
  if (window.navigator.app && window.navigator.app.backHistory)
    window.navigator.app.backHistory();
  else
    window.history.go(-1);
}

const perfIconsMap = {
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
  horde: '_',
  fromPosition: '*'
};

export function gameIcon(perf) {
  return perfIconsMap[perf] || '8';
}

export function secondsToMinutes(sec) {
  return sec === 0 ? sec : sec / 60;
}

export function tupleOf(x) {
  return [x.toString(), x.toString()];
}

export function oppositeColor(color) {
  return color === 'white' ? 'black' : 'white';
}

export function caseInsensitiveSort(a, b) {
  var alow = a.toLowerCase();
  var blow = b.toLowerCase();

  return alow > blow ? 1 : (alow < blow ? -1 : 0);
}

export function userFullNameToId(fullName) {
  var split = fullName.split(' ');
  var id = split.length === 1 ? split[0] : split[1];
  return id.toLowerCase();
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function loadJsonFile(filename) {
  return m.request({
    url: filename,
    method: 'GET',
    deserialize: function(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw { error: 'Error when parsing json from: ' + filename };
      }
    }
  });
}

// Returns a random number between min (inclusive) and max (exclusive)
export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
