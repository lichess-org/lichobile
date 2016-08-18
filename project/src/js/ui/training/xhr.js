import { request } from '../../http';

export function attempt(id, startedAt, win) {
  return request(`/training/${id}/attempt`, {
    method: 'POST',
    body: JSON.stringify({
      win: win ? 1 : 0,
      time: new Date().getTime() - (startedAt || new Date()).getTime()
    })
  });
}

export function vote(id, v) {
  return request(`/training/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      vote: v
    })
  });
}

export function setDifficulty(d) {
  return request('/training/difficulty', {
    method: 'POST',
    body: JSON.stringify({
      difficulty: d
    })
  });
}

export function loadPuzzle(id) {
  return request(`/training/${id}/load`);
}

export function newPuzzle() {
  return request('/training/new');
}

export function history() {
  return request('/training/history');
}
