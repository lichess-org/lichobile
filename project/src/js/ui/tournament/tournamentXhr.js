import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {data: {socketVersion: 1}}, true);
}

export function reload(ctrl) {
  return request('/tournament/' + ctrl.tournament().id, { background: true });
}

export function resync(ctrl) {
  return request('/tournament/' + ctrl.tournament().id, { background: true, data: {socketVersion: 1} });
}
