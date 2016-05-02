import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {data: {socketVersion: 1}}, true);
}

export function reload(id) {
  return request('/tournament/' + id, { background: true });
}

export function resync(id) {
  return request('/tournament/' + id, { background: true, data: {socketVersion: 1} });
}

export function join(id) {
  return request('/tournament/' + id + '/join', {method: 'POST'});
}

export function withdraw(id) {
  return request('/tournament/' + id + '/withdraw', {method: 'POST'});
}
