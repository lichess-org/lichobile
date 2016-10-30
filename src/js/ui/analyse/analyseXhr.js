import { fetchText } from '../../http';

export function requestComputerAnalysis(gameId) {
  return fetchText(`/${gameId}/request-analysis`, {
    method: 'POST'
  }, null, true);
}
