import storage from '../storage';

const otbStorageKey = 'otb.current';
const aiStorageKey = 'ai.current';

export function getCurrentOTBGame() {
  return storage.get(otbStorageKey);
}

export function getAnalyseData(data) {
  if (!data) return null;
  console.log(data);
  data.data.steps = data.situations.map(o => {
    console.log(o);
    return {
      fen: o.fen,
      ply: o.ply,
      san: o.pgnMoves[o.pgnMoves.length - 1],
      uci: o.lastMove.uci,
      dests: o.dests
    };
  });
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
