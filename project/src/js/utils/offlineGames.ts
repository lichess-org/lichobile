import storage from '../storage';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';

const otbStorageKey = 'otb.current';
const aiStorageKey = 'ai.current';

export function getCurrentOTBGame() {
  return storage.get(otbStorageKey);
}

export function getAnalyseData(data) {
  if (!data) return null;
  data.data.steps = data.situations.map(o => {
    return {
      fen: o.fen,
      ply: o.ply,
      checkCount: o.checkCount,
      san: o.pgnMoves.length ? o.pgnMoves[o.pgnMoves.length - 1] : null,
      uci: o.uciMoves.length ? o.uciMoves[o.uciMoves.length - 1] : null,
      dests: o.dests,
      crazy: o.crazyhouse
    };
  });
  data.data.endSituation = data.situations[data.situations.length - 1];
  return data.data;
}

export function setCurrentOTBGame(game): void {
  storage.set(otbStorageKey, game);
}

export function getCurrentAIGame() {
  return storage.get(aiStorageKey);
}

export function setCurrentAIGame(game): void {
  storage.set(aiStorageKey, game);
}

const offlineCorresStorageKey = 'offline.corres.games';

export function getOfflineGames() {
  const stored = storage.get(offlineCorresStorageKey) || {};
  let arr = [];
  for (const i in stored) {
    arr.push(stored[i]);
  }
  return arr;
}

export function getOfflineGameData(id) {
  const stored = storage.get(offlineCorresStorageKey) || {};
  return stored[id];
}

export function saveOfflineGameData(id, gameData) {
  const stored = storage.get(offlineCorresStorageKey) || {};
  const toStore = cloneDeep(gameData);
  toStore.player.onGame = false;
  toStore.opponent.onGame = false;
  if (toStore.player.user) toStore.player.user.online = false;
  if (toStore.opponent.user) toStore.opponent.user.online = false;
  stored[id] = toStore;
  storage.set(offlineCorresStorageKey, stored);
}

export function removeOfflineGameData(id) {
  const stored = storage.get(offlineCorresStorageKey);
  if (stored && stored[id]) {
    delete stored[id];
  }
  storage.set(offlineCorresStorageKey, stored);
}

export function syncWithNowPlayingGames(nowPlaying) {
  if (nowPlaying === undefined) return;

  const stored = storage.get(offlineCorresStorageKey);
  const storedIds = Object.keys(stored);
  const toRemove = difference(storedIds, nowPlaying.map(g => g.fullId));

  if (toRemove.length > 0) {
    toRemove.forEach(id => {
      if (stored && stored[id]) {
        delete stored[id];
      }
    });
    storage.set(offlineCorresStorageKey, stored);
  }
}
