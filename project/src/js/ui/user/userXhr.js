import http from '../../http';

export function follow(userId) {
  return http.request('/rel/follow/' + userId, { method: 'POST' }, true);
}

export function unfollow(userId) {
  return http.request('/rel/unfollow/' + userId, { method: 'POST' }, true);
}

export function block(userId) {
  return http.request('/rel/block/' + userId, { method: 'POST' }, true);
}

export function unblock(userId) {
  return http.request('/rel/unblock/' + userId, { method: 'POST' }, true);
}

export function user(id) {
  var url = '/api/user/' + id;
  return http.request(url, {}, true);
}

export function games(username, rated) {
  return http.request('/api/game', {
    method: 'GET',
    data: {
      username: username,
      rated: rated
    }
  }, true);
}
