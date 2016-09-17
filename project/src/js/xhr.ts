import { fetchJSON, fetchText, apiVersion } from './http';
import { lichessSri, noop } from './utils';
import settings from './settings';
import i18n from './i18n';
import session from './session';

interface GameSetup {
  variant: string;
  timeMode: string;
  days: string;
  time: string;
  increment: string;
  color: string;
  mode?: string;
  membersOnly?: boolean;
  ratingRange?: string;
  fen?: string;
  level?: string;
}

export function newAiGame(fen: string) {
  const config = settings.gameSetup.ai;
  const body: GameSetup = {
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
  const config = settings.gameSetup.human;
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

export function challenge(userId: string, fen: string) {
  const config = settings.gameSetup.challenge;
  const url = userId ? `/setup/friend?user=${userId}` : '/setup/friend';

  const body: GameSetup = {
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
  return fetchJSON('/challenge');
}

export function getChallenge(id: string) {
  return fetchJSON(`/challenge/${id}`, {}, true);
}

export function cancelChallenge(id: string) {
  return fetchText(`/challenge/${id}/cancel`, {
    method: 'POST'
  }, true);
}

export function declineChallenge(id: string) {
  return fetchText(`/challenge/${id}/decline`, {
    method: 'POST'
  }, true);
}

export function acceptChallenge(id: string) {
  return fetchJSON(`/challenge/${id}/accept`, { method: 'POST'}, true);
}

export function lobby(feedback: boolean) {
  return fetchJSON('/', null, feedback);
}

export function seeks(feedback: boolean) {
  return fetchJSON('/lobby/seeks', null, feedback);
}

export function game(id: string, color?: string) {
  let url = '/' + id;
  if (color) url += ('/' + color);
  return fetchJSON(url, null);
}

export function toggleGameBookmark(id: string) {
  return fetchText('/bookmark/' + id, {
    method: 'POST'
  });
}

export function featured(channel: string, flip: boolean) {
  return fetchJSON('/tv/' + channel, flip ? { query: { flip: 1 }} : {});
}

export function setServerLang(lang: string) {
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

export function miniUser(userId: string) {
  return fetchJSON(`/@/${userId}/mini`);
}

export function timeline() {
  return fetchJSON('/timeline', null, false);
}

export function status() {
  return fetchJSON('/api/status')
  .then(function(data) {
    if (data.api.current !== apiVersion) {
      for (let i = 0, len = data.api.olds.length; i < len; i++) {
        const o = data.api.olds[i];
        if (o.version === apiVersion) {
          const now = new Date(),
            unsupportedDate = new Date(o.unsupportedAt),
            deprecatedDate = new Date(o.deprecatedAt);

          if (now > unsupportedDate)
            window.navigator.notification.alert(
              i18n('apiUnsupported'),
              noop
            );
          else if (now > deprecatedDate)
            window.navigator.notification.alert(
              i18n('apiDeprecated', window.moment(unsupportedDate).format('LL')),
              noop
            );
          break;
        }
      }
    }
  });
}
