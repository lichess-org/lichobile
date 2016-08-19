import { fetchJSON } from '../../http';

export function autocomplete(term) {
  return fetchJSON('/player/autocomplete', { query: { term }});
}

export function suggestions(userId) {
  return fetchJSON(`/@/${userId}/suggestions`, {}, true);
}

export function onlinePlayers() {
  return fetchJSON('/player/online', { query: { nb: 100 }}, true);
}

export function ranking() {
  return fetchJSON('/player', {}, true);
}
