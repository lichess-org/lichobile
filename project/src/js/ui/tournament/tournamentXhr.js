import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {data: {socketVersion: 1}}, true);
}

export function reload(id, page) {
  return request('/tournament/' + id,
  {
    method: 'GET',
    data: page ? { page: page } : {},
    background: true
  });
}

export function join(id) {
  return request('/tournament/' + id + '/join', {method: 'POST'});
}

export function withdraw(id) {
  return request('/tournament/' + id + '/withdraw', {method: 'POST'});
}

export function playerInfo(tournamentId, playerId) {
  return request('/tournament/' + tournamentId + '/player/' + playerId, {}, true);
}
