import { fetchJSON, fetchText, apiVersion } from './http';
import { lichessSri } from './utils';
import settings from './settings';
import i18n from './i18n';
import session from './session';

export function newAiGame(fen) {
  const config = settings.gameSetup.ai;
  const body = {
    variant: config.variant(),
    timeMode: config.timeMode(),
    days: config.days(),
    time: config.time(),
    increment: config.increment(),
    level: config.level(),
    color: config.color()
  };

  if (fen) body.fen = fen;

  return fetchJSON('/setup/ai', {
    method: 'POST',
    body: JSON.stringify(body)
  }, true);
}

export function seekGame() {
  var config = settings.gameSetup.human;
  return fetchJSON('/setup/hook/' + lichessSri, {
    method: 'POST',
    body: JSON.stringify({
      variant: config.variant(),
      timeMode: config.timeMode(),
      days: config.days(),
      time: config.time(),
      increment: config.increment(),
      color: config.color(),
      mode: session.isConnected() ? config.mode() : '0',
      membersOnly: config.membersOnly(),
      ratingRange: config.ratingMin() + '-' + config.ratingMax()
    })
  }, true);
}

export function challenge(userId, fen) {
  const config = settings.gameSetup.challenge;
  const url = userId ? `/setup/friend?user=${userId}` : '/setup/friend';

  const body = {
    variant: config.variant(),
    timeMode: config.timeMode(),
    days: config.days(),
    time: config.time(),
    increment: config.increment(),
    color: config.color(),
    mode: session.isConnected() ? config.mode() : '0'
  };

  if (fen) body.fen = fen;

  return fetchJSON(url, {
    method: 'POST',
    body: JSON.stringify(body)
  }, true);
}

export function getChallenges() {
  return fetchJSON('/challenge', {}, true);
}

export function getChallenge(id) {
  return fetchJSON(`/challenge/${id}`, {}, true);
}

export function cancelChallenge(id) {
  return fetchText(`/challenge/${id}/cancel`, {
    method: 'POST'
  }, true);
}

export function declineChallenge(id) {
  return fetchText(`/challenge/${id}/decline`, {
    method: 'POST'
  }, true);
}

export function acceptChallenge(id) {
  return fetchJSON(`/challenge/${id}/accept`, { method: 'POST'}, true);
}

export function lobby(feedback) {
  return fetchJSON('/', null, feedback);
}

export function seeks(feedback) {
  return fetchJSON('/lobby/seeks', null, feedback);
}

export function game(id, color) {
  var url = '/' + id;
  if (color) url += ('/' + color);
  return fetchJSON(url, {
    cache: 'reload'
  }, true);
}

export function toggleGameBookmark(id) {
  return fetchText('/bookmark/' + id, {
    method: 'POST'
  });
}

export function featured(channel, flip) {
  return fetchJSON('/tv/' + channel, flip ? { query: { flip: 1 }} : {});
}

export function setServerLang(lang) {
  if (session.isConnected()) {
    return fetchJSON('/translation/select', {
      method: 'POST',
      body: JSON.stringify({
        lang
      })
    });
  } else {
    return Promise.resolve();
  }
}

export function miniUser(userId) {
  return fetchJSON(`/@/${userId}/mini`);
}

export function timeline() {
  return fetchJSON('/timeline', null, false);
}

export function status() {
  return fetchJSON('/api/status')
  .then(function(data) {
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
