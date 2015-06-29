import { request } from '../../http';

export function autocomplete(term) {
  return request('/player/autocomplete', { data: { term }});
}

export function suggestions(userId) {
  return request(`/@/${userId}/suggestions`, {}, true);
}

export function onlinePlayers() {
  return request('/player/online', { data: { nb: 100 }}, true);
}

export function ranking() {
  return request('/player', {}, true);
}
