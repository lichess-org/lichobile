var utils = require('./utils');
var http = require('./http');
var settings = require('./settings');
var i18n = require('./i18n');
var moment = window.moment;
var semver = require('semver');
var session = require('./session');

function newAiGame() {
  var config = settings.game.ai;
  return http.request('/setup/ai', {
    method: 'POST',
    data: {
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: config.time(),
      increment: config.increment(),
      level: config.level(),
      color: config.color()
    }
  }, true);
}

function seekGame() {
  var config = settings.game.human;
  return http.request('/setup/hook/' + utils.lichessSri, {
    method: 'POST',
    data: {
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: config.time(),
      increment: config.increment(),
      color: 'random',
      mode: session.isConnected() ? config.mode() : '0',
      ratingRange: config.ratingMin() + '-' + config.ratingMax()
    }
  }, true);
}

function lobby(feedback) {
  return http.request('/', null, feedback);
}

function seeks(feedback) {
  return http.request('/lobby/seeks', null, feedback);
}

function game(id) {
  return http.request('/' + id);
}

function status() {
  return http.request('/api/status', {
    background: true
  }).then(function(data) {
    if (data.api.current !== http.apiVersion) {
      for (var i = 0, len = data.api.olds.length; i < len; i++) {
        var o = data.api.olds[i];
        if (o.version === http.apiVersion) {
          var now = new Date(),
            unsupportedDate = new Date(o.unsupportedAt),
            deprecatedDate = new Date(o.deprecatedAt);

          if (now > unsupportedDate)
            window.navigator.notification.alert(
              i18n('apiUnsupported')
            );
          else if (now > deprecatedDate)
            window.navigator.notification.alert(
              i18n('apiDeprecated', moment(unsupportedDate).format('LL'))
            );
          break;
        }
      }
    }
  });
}

function friends() {
  return http.request('/');
}

module.exports = {
  newAiGame: newAiGame,
  seekGame: seekGame,
  lobby: lobby,
  seeks: seeks,
  game: game,
  status: status,
  friends: friends
};
