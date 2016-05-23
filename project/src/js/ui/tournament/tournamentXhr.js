import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}

export function tournament(id) {
  return request('/tournament/' + id, {data: {socketVersion: 1}}, true);
}

export function reload(id, page) {
  console.log('page:' + page);
  const data = page ? { page: page } : {};
  return request('/tournament/' + id,
  {
    method: 'GET',
    data: data,
    background: true
  });
}

export function join(id) {
  return request('/tournament/' + id + '/join', {method: 'POST'});
}

export function withdraw(id) {
  return request('/tournament/' + id + '/withdraw', {method: 'POST'});
}
