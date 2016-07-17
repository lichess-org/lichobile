import { request } from '../../http';

export function requestComputerAnalysis(gameId) {
  return request(`/${gameId}/request-analysis`, {
    method: 'POST',
    deserialize: t => t
  }, null, true);
}
