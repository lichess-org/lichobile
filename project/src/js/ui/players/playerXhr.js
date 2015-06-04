import http from '../../http';

export function autocomplete(term) {
  return http.request('/player/autocomplete', { data: { term }});
}

export function suggestions(userId) {
  return http.request(`/@/${userId}/suggestions`, {}, true);
}

export function onlinePlayers() {
  return http.request('/player/online', {}, true);
}
