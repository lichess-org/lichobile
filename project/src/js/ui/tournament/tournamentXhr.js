import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {}, true);
}

export function reload(ctrl) {
  return request('/tournament/' + ctrl.tournamentId(), { background: true });
}
