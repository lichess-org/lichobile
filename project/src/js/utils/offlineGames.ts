import storage from '../storage';
import { cloneDeep, difference } from 'lodash';
import { AnalysisData, AnalysisStep } from '../ui/analyse/interfaces';

const otbStorageKey = 'otb.current';
const aiStorageKey = 'ai.current';

export function getCurrentOTBGame(): StoredOfflineGame {
  return storage.get<StoredOfflineGame>(otbStorageKey);
}

export function getAnalyseData(data: StoredOfflineGame): AnalysisData {
  if (!data) return null;
  const aData = <AnalysisData>data.data;
  aData.steps = data.situations.map((o: GameSituation) => {
    const step: AnalysisStep = {
      fen: o.fen,
      ply: o.ply,
      check: o.check,
      checkCount: o.checkCount,
      san: o.pgnMoves.length ? o.pgnMoves[o.pgnMoves.length - 1] : null,
      uci: o.uciMoves.length ? o.uciMoves[o.uciMoves.length - 1] : null,
      dests: o.dests,
      drops: o.drops,
      crazy: o.crazyhouse,
      pgnMoves: o.pgnMoves
    };
    return step;
  });
  return aData;
}

export function setCurrentOTBGame(game: StoredOfflineGame): void {
  storage.set(otbStorageKey, game);
}

export function getCurrentAIGame(): StoredOfflineGame {
  return storage.get<StoredOfflineGame>(aiStorageKey);
}

export function setCurrentAIGame(game: StoredOfflineGame): void {
  storage.set(aiStorageKey, game);
}

const offlineCorresStorageKey = 'offline.corres.games';

export function getOfflineGames(): StoredOfflineGame[] {
  const stored = storage.get(offlineCorresStorageKey) || {};
  let arr: StoredOfflineGame[] = [];
  for (const i in stored) {
    arr.push(stored[i]);
  }
  return arr;
}

export function getOfflineGameData(id: string) {
  const stored = storage.get(offlineCorresStorageKey) || {};
  return stored[id];
}

export function saveOfflineGameData(id: string, gameData: OnlineGameData) {
  const stored = storage.get(offlineCorresStorageKey) || {};
  const toStore = cloneDeep(gameData);
  toStore.player.onGame = false;
  toStore.opponent.onGame = false;
  if (toStore.player.user) toStore.player.user.online = false;
  if (toStore.opponent.user) toStore.opponent.user.online = false;
  stored[id] = toStore;
  storage.set(offlineCorresStorageKey, stored);
}

export function removeOfflineGameData(id: string) {
  const stored = storage.get(offlineCorresStorageKey);
  if (stored && stored[id]) {
    delete stored[id];
  }
  storage.set(offlineCorresStorageKey, stored);
}

export function syncWithNowPlayingGames(nowPlaying: any) {
  if (nowPlaying === undefined) return;

  const stored = storage.get(offlineCorresStorageKey) || {};
  const storedIds = Object.keys(stored);
  // TODO make now playing game type
  const toRemove = difference(storedIds, nowPlaying.map((g: any) => g.fullId));

  if (toRemove.length > 0) {
    toRemove.forEach(id => {
      if (stored && stored[id]) {
        delete stored[id];
      }
    });
    storage.set(offlineCorresStorageKey, stored);
  }
}
