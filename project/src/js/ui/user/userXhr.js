import http from '../../http';

export function follow(userId) {
  return http.request('/rel/follow/' + userId, { method: 'POST' });
}

export function unfollow(userId) {
  return http.request('/rel/unfollow/' + userId, { method: 'POST' });
}

export function block(userId) {
  return http.request('/rel/block/' + userId, { method: 'POST' });
}

export function unblock(userId) {
  return http.request('/rel/unblock/' + userId, { method: 'POST' });
}

export function user(id) {
  var url = '/api/user/' + id;
  return http.request(url, {}, true);
}

export function games(userId, filter='all', page=1, feedback=false) {
  return http.request(`/@/${userId}/${filter}`, {
    method: 'GET',
    data: {
      page
    }
  }, feedback);
}
