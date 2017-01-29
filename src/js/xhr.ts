import { fetchJSON, fetchText, apiVersion } from './http';
import { lichessSri, noop } from './utils';
import settings from './settings';
import i18n from './i18n';
import session from './session';
import { TimelineData, LobbyData, HookData, Pool, Seek } from './lichess/interfaces';
import { ChallengesData, Challenge } from './lichess/interfaces/challenge';

interface GameSetup {
  variant: string;
  timeMode: string;
  days: string;
  time: string;
  increment: string;
  color: string;
  mode?: string;
  ratingRange?: string;
  fen?: string;
  level?: string;
}

export function newAiGame(fen: string): Promise<OnlineGameData> {
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

export function seekGame(): Promise<HookData> {
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
      ratingRange: config.ratingMin() + '-' + config.ratingMax()
    })
  }, true);
}

export function challenge(userId: string, fen: string): Promise<{ challenge: Challenge }> {
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

export function getChallenges(): Promise<ChallengesData> {
  return fetchJSON('/challenge');
}

interface ChallengeData {
  challenge: Challenge
  socketVersion: number
}
export function getChallenge(id: string): Promise<ChallengeData> {
  return fetchJSON(`/challenge/${id}`, {}, true);
}

export function cancelChallenge(id: string): Promise<string> {
  return fetchText(`/challenge/${id}/cancel`, {
    method: 'POST'
  }, true);
}

export function declineChallenge(id: string): Promise<string> {
  return fetchText(`/challenge/${id}/decline`, {
    method: 'POST'
  }, true);
}

export function acceptChallenge(id: string): Promise<OnlineGameData> {
  return fetchJSON(`/challenge/${id}/accept`, { method: 'POST'}, true);
}

export let cachedPools: Array<Pool> = []
export function lobby(feedback?: boolean): Promise<LobbyData> {
  return fetchJSON('/', null, feedback)
  .then((d: LobbyData) => {
    if (d.lobby.pools !== undefined) cachedPools = d.lobby.pools
    return d
  })
}

export function seeks(feedback: boolean): Promise<Array<Seek>> {
  return fetchJSON('/lobby/seeks', null, feedback);
}

export function game(id: string, color?: string): Promise<OnlineGameData> {
  let url = '/' + id;
  if (color) url += ('/' + color);
  return fetchJSON(url, null);
}

export function toggleGameBookmark(id: string) {
  return fetchText('/bookmark/' + id, {
    method: 'POST'
  });
}

export function featured(channel: string, flip: boolean): Promise<OnlineGameData> {
  return fetchJSON('/tv/' + channel, flip ? { query: { flip: 1 }} : {});
}

export function importMasterGame(gameId: string, orientation: Color): Promise<OnlineGameData> {
  return fetchJSON(`/import/master/${gameId}/${orientation}`)
}

export function setServerLang(lang: string): Promise<void> {
  if (session.isConnected()) {
    return fetchJSON('/translation/select', {
      method: 'POST',
      body: JSON.stringify({
        lang
      })
    })
    .then(() => {});
  } else {
    return Promise.resolve();
  }
}

export function miniUser(userId: string) {
  return fetchJSON(`/@/${userId}/mini`);
}

export function timeline(): Promise<TimelineData> {
  return fetchJSON('/timeline', null, false);
}

export function status() {
  return fetchJSON('/api/status')
  .then((data: any) => {
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

export function createToken() {
  return fetchJSON('/auth/token', {method: 'POST'}, true);
}

export function openWebsitePatronPage() {
  createToken().then((data: {url: string, userId: string}) => {
    window.open(data.url + '?referrer=/patron', '_blank', 'location=no');
  });
}
