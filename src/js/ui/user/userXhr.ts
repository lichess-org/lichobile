import { fetchJSON } from '../../http';

export function games(userId: string, filter = 'all', page = 1, feedback = false) {
  return fetchJSON(`/@/${userId}/${filter}`, {
    query: {
      page
    }
  }, feedback);
}

export function following(userId: string, page = 1, feedback = false) {
  return fetchJSON(`/@/${userId}/following`, {
    query: {
      page
    }
  }, feedback);
}

export function followers(userId: string, page = 1, feedback = false) {
  return fetchJSON(`/@/${userId}/followers`, {
    query: {
      page
    }
  }, feedback);
}

export function follow(userId: string) {
  return fetchJSON('/rel/follow/' + userId, { method: 'POST' });
}

export function unfollow(userId: string) {
  return fetchJSON('/rel/unfollow/' + userId, { method: 'POST' });
}

export function block(userId: string) {
  return fetchJSON('/rel/block/' + userId, { method: 'POST' });
}

export function unblock(userId: string) {
  return fetchJSON('/rel/unblock/' + userId, { method: 'POST' });
}

export function user(id: string, feedback = true) {
  return fetchJSON(`/api/user/${id}`, null, feedback);
}

export function tv(userId: string): Promise<OnlineGameData> {
  return fetchJSON(`/@/${userId}/tv`);
}

export function variantperf(userId: string, variantKey: string) {
  return fetchJSON(`/@/${userId}/perf/${variantKey}?graph=1`, null, false);
}
