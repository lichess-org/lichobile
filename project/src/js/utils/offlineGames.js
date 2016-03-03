import storage from '../storage';

const otbStorageKey = 'otb.current';
const aiStorageKey = 'ai.current';

function lastMoveToUci(move) {
  if (move) {
    return move[0] + move[1];
  } else {
    return null;
  }
}

export function getCurrentOTBGame() {
  return storage.get(otbStorageKey);
}

export function getAnalyseData(data) {
  if (!data) return null;
  data.data.steps = data.situations.map(o => {
    return {
      fen: o.fen,
      ply: o.ply,
      san: o.san,
      uci: lastMoveToUci(o.lastMove),
      dests: o.movable.dests
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
