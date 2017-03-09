import { fetchText } from '../../http'

export function requestComputerAnalysis(gameId: string) {
  return fetchText(`/${gameId}/request-analysis`, {
    method: 'POST'
  }, true)
}
