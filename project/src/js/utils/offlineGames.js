import storage from '../storage';

const otbStorageKey = 'otb.current';

export function getCurrentOTBGame() {
  return storage.get(otbStorageKey);
}

export function getCurrentOTBAnalyse() {
  const data = storage.get(otbStorageKey);

  if (!data) return null;
  data.data.steps = data.situations.map(o => {
    return {
      fen: o.fen,
      ply: o.ply,
      san: o.san,
      dests: o.movable.dests
    };
  });
  return data.data;
}

export function setCurrentOTBGame(game) {
  storage.set(otbStorageKey, game);
}
