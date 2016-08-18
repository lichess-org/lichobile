import { fetchJSON } from '../../http';

export function autocomplete(term) {
  return fetchJSON('/player/autocomplete', { data: { term }});
}

export function suggestions(userId) {
  return fetchJSON(`/@/${userId}/suggestions`, {}, true);
}

export function onlinePlayers() {
  return fetchJSON('/player/online', { data: { nb: 100 }}, true);
}

export function ranking() {
  return fetchJSON('/player', {}, true);
}
