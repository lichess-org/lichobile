import { fetchJSON } from '../../http';

export function games(userId, filter = 'all', page = 1, feedback = false) {
  return fetchJSON(`/@/${userId}/${filter}`, {
    method: 'GET',
    data: {
      page
    }
  }, feedback);
}

export function following(userId, page = 1, feedback = false) {
  return fetchJSON(`/@/${userId}/following`, {
    method: 'GET',
    data: {
      page
    }
  }, feedback);
}

export function followers(userId, page = 1, feedback = false) {
  return fetchJSON(`/@/${userId}/followers`, {
    method: 'GET',
    data: {
      page
    }
  }, feedback);
}

export function follow(userId) {
  return fetchJSON('/rel/follow/' + userId, { method: 'POST' });
}

export function unfollow(userId) {
  return fetchJSON('/rel/unfollow/' + userId, { method: 'POST' });
}

export function block(userId) {
  return fetchJSON('/rel/block/' + userId, { method: 'POST' });
}

export function unblock(userId) {
  return fetchJSON('/rel/unblock/' + userId, { method: 'POST' });
}

export function user(id) {
  var url = '/api/user/' + id;
  return fetchJSON(url, {}, true);
}

export function tv(userId) {
  return fetchJSON(`/@/${userId}/tv`);
}

export function variantperf(userId, variantKey) {
  return fetchJSON(`/@/${userId}/perf/${variantKey}`, {}, true);
}
