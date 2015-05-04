var utils = require('./utils');
var http = require('./http');
var settings = require('./settings');
var i18n = require('./i18n');
var moment = window.moment;
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

function inviteFriend() {
  var config = settings.game.invite;
  return http.request('/setup/friend', {
    method: 'POST',
    data: {
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: config.time(),
      increment: config.increment(),
      color: config.color(),
      mode: session.isConnected() ? config.mode() : '0',
    }
  }, true);
}

function cancelInvite(url) {
  return http.request(url + '/cancel');
}

function joinUrlChallenge(id) {
  return http.request('/' + id + '/join', { method: 'POST' }, true);
}

function lobby(feedback) {
  return http.request('/', null, feedback);
}

function seeks(feedback) {
  return http.request('/lobby/seeks', null, feedback);
}

function game(id, color) {
  var url = '/' + id;
  if (color) url += ('/' + color);
  return http.request(url);
}

function featured(flip) {
  return http.request('/tv/lichess', flip ? { data: { flip: 1 }} : {});
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

function user(id) {
  var url = '/api/user/' + id;
  return http.request(url);
}

function games(username, rated) {
  return http.request('/api/game', {
    method: 'GET',
    data: {
      username: username,
      rated: rated
    }
  });
}

module.exports = {
  newAiGame: newAiGame,
  seekGame: seekGame,
  inviteFriend: inviteFriend,
  cancelInvite: cancelInvite,
  joinUrlChallenge: joinUrlChallenge,
  lobby: lobby,
  seeks: seeks,
  game: game,
  featured: featured,
  status: status,
  user: user,
  games: games
};
