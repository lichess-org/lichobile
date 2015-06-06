import http from '../../http';

export function autocomplete(term) {
  return http.request('/player/autocomplete', { data: { term }});
}

export function suggestions(userId) {
  return http.request(`/@/${userId}/suggestions`, {}, true);
}

export function onlinePlayers() {
  return http.request('/player/online', { data: { nb: 100 }}, true);
}

export function ranking() {
  return http.request('/player', {}, true);
}
