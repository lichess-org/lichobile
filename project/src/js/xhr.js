import * as utils from './utils';
import { request, apiVersion } from './http';
import settings from './settings';
import i18n from './i18n';
import session from './session';

export function newAiGame() {
  var config = settings.game.ai;
  return request('/setup/ai', {
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

export function seekGame() {
  var config = settings.game.human;
  return request('/setup/hook/' + utils.lichessSri, {
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

export function inviteFriend(userId) {
  var config = settings.game.challenge;
  return request('/setup/friend', {
    method: 'POST',
    data: {
      user: userId,
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: config.time(),
      increment: config.increment(),
      color: config.color(),
      mode: session.isConnected() ? config.mode() : '0'
    }
  }, true);
}

export function cancelChallenge(url) {
  return request(url + '/cancel');
}

export function joinChallenge(id) {
  return request('/' + id + '/join', { method: 'POST' }, true);
}

export function getChallenge(id) {
  return request('/' + id, { background: true });
}

export function declineChallenge(id) {
  return request('/setup/decline?gameId=' + id, {
    method: 'POST',
    deserialize: v => v
  }, true);
}

export function lobby(feedback) {
  return request('/', null, feedback);
}

export function seeks(feedback) {
  return request('/lobby/seeks', null, feedback);
}

export function game(id, color, background) {
  var url = '/' + id;
  if (color) url += ('/' + color);
  return request(url, { background });
}

export function toggleGameBookmark(id) {
  return request('/bookmark/' + id, {
    method: 'POST',
    deserialize: v => v
  });
}

export function featured(channel, flip) {
  return request('/tv/' + channel, flip ? { data: { flip: 1 }} : {});
}

export function status() {
  return request('/api/status', {
    background: true
  }).then(function(data) {
    if (data.api.current !== apiVersion) {
      for (var i = 0, len = data.api.olds.length; i < len; i++) {
        var o = data.api.olds[i];
        if (o.version === apiVersion) {
          var now = new Date(),
            unsupportedDate = new Date(o.unsupportedAt),
            deprecatedDate = new Date(o.deprecatedAt);

          if (now > unsupportedDate)
            window.navigator.notification.alert(
              i18n('apiUnsupported')
            );
          else if (now > deprecatedDate)
            window.navigator.notification.alert(
              i18n('apiDeprecated', window.moment(unsupportedDate).format('LL'))
            );
          break;
        }
      }
    }
  });
}
