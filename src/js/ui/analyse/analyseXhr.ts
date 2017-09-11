import { fetchJSON, fetchText } from '../../http'
import { AnalyseData } from '../../lichess/interfaces/analyse'

export function gameAnalysis(gameId: string, color: Color): Promise<AnalyseData> {
  return fetchJSON(`/${gameId}/${color}/analysis`)
}

export function requestComputerAnalysis(gameId: string) {
  return fetchText(`/${gameId}/request-analysis`, {
    method: 'POST'
  }, true)
}
