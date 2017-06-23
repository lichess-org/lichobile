import { fetchJSON, fetchText } from '../../http'
import { AnalysisData } from './interfaces'

export function gameAnalysis(gameId: string, color: Color): Promise<AnalysisData> {
  return fetchJSON(`/${gameId}/${color}/analysis`)
}

export function requestComputerAnalysis(gameId: string) {
  return fetchText(`/${gameId}/request-analysis`, {
    method: 'POST'
  }, true)
}
