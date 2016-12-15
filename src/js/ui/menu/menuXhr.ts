import { fetchJSON } from '../../http';

export function createToken() {
  return fetchJSON('/auth/token', {method: 'POST'}, true);
}
