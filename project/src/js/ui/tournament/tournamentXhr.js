import { request } from '../../http';

export function currentTournaments() {
  return request('/tournament', {}, true);
}
