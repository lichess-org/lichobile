var utils = require('./utils');
var http = require('./http');
var settings = require('./settings');
var i18n = require('./i18n');
var moment = window.moment;
var semver = require('semver');

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
      color: config.color(),
      mode: config.mode()
    }
  }, true);
}

function lobby(feedback) {
  return http.request('/', null, feedback);
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
    } else if (window.lichess.version && semver.gt(data.app.current, window.lichess.version)) {
      window.navigator.notification.alert(
        i18n('appUpgradeAvailable')
      );
    }
  });
}

module.exports = {
  newAiGame: newAiGame,
  seekGame: seekGame,
  lobby: lobby,
  game: game,
  status: status
};
