import storage from '../storage';

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

export function setCurrentOTBGame(game) {
  storage.set(otbStorageKey, game);
}

export function getCurrentAIGame() {
  return storage.get(aiStorageKey);
}

export function setCurrentAIGame(game) {
  storage.set(aiStorageKey, game);
}
