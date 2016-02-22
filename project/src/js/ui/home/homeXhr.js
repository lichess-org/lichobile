import { request } from '../../http';

export function featured() {
  return request('/tv', {}, true);
}
