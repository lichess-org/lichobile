import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {}, true);
}
