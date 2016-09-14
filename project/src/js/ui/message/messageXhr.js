import { fetchJSON } from '../../http';

export function inbox() {
  return fetchJSON('/inbox', {}, true);
}
