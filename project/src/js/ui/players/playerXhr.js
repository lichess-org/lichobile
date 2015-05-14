import http from '../../http';

export function autocomplete(term) {
  return http.request('/player/autocomplete', { data: { term }});
}
