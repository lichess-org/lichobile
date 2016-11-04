import { fetchJSON } from '../../http';

export function currentTournaments() {
  return fetchJSON('/tournament', {}, true);
}

export function tournament(id) {
  return fetchJSON('/tournament/' + id, {query: {socketVersion: 1}}, true);
}

export function reload(id, page) {
  return fetchJSON('/tournament/' + id,
  {
    method: 'GET',
    query: page ? { page } : {}
  });
}

export function join(id) {
  return fetchJSON('/tournament/' + id + '/join', {method: 'POST'});
}

export function withdraw(id) {
  return fetchJSON('/tournament/' + id + '/withdraw', {method: 'POST'});
}

export function playerInfo(tournamentId, playerId) {
  return fetchJSON('/tournament/' + tournamentId + '/player/' + playerId, {}, true);
}

export function create(variant, position, mode, clockTime, clockIncrement, minutes, waitMinutes) {
  return fetchJSON('/tournament/new', {
    method: 'POST',
    body: JSON.stringify({
      variant,
      position,
      mode,
      clockTime,
      clockIncrement,
      minutes,
      waitMinutes
    })
  }, true);
}
