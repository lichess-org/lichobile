import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {data: {socketVersion: 1}}, true);
}

export function reload(id) {
  return request(`/tournament/${id}`, { background: true });
}
