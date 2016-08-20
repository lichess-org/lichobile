import { fetchJSON } from '../../http';

export function attempt(id, startedAt, win) {
  return fetchJSON(`/training/${id}/attempt`, {
    method: 'POST',
    body: JSON.stringify({
      win: win ? 1 : 0,
      time: new Date().getTime() - (startedAt || new Date()).getTime()
    })
  });
}

export function vote(id, v) {
  return fetchJSON(`/training/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      vote: v
    })
  });
}

export function setDifficulty(d) {
  return fetchJSON('/training/difficulty', {
    method: 'POST',
    body: JSON.stringify({
      difficulty: d
    })
  });
}

export function loadPuzzle(id) {
  return fetchJSON(`/training/${id}/load`);
}

export function newPuzzle() {
  return fetchJSON('/training/new');
}

export function history() {
  return fetchJSON('/training/history');
}
