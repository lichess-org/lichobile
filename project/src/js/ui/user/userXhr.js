import { request } from '../../http';

export function follow(userId) {
  return request('/rel/follow/' + userId, { method: 'POST' });
}

export function unfollow(userId) {
  return request('/rel/unfollow/' + userId, { method: 'POST' });
}

export function block(userId) {
  return request('/rel/block/' + userId, { method: 'POST' });
}

export function unblock(userId) {
  return request('/rel/unblock/' + userId, { method: 'POST' });
}

export function user(id) {
  var url = '/api/user/' + id;
  return request(url, {}, true);
}

export function games(userId, filter='all', page=1, feedback=false) {
  return request(`/@/${userId}/${filter}`, {
    method: 'GET',
    data: {
      page
    },
    background: !feedback
  }, feedback);
}

export function tv(userId) {
  return request(`/@/${userId}/tv`);
}
