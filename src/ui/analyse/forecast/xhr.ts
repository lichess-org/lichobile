import { fetchJSON } from '~/http'
import { ForecastData, ForecastStep } from '~/lichess/interfaces/forecast'

interface SaveResponse extends ForecastData {
  reload?: boolean
}

export function saveForecasts(
  gameId: string,
  playerId: string,
  forecasts: ForecastStep[][]
): Promise<SaveResponse> {
  return fetchJSON(
    `/${gameId}${playerId}/forecasts`,
    {
      method: 'POST',
      body: JSON.stringify(forecasts),
    }
  )
}

export function playAndSaveForecasts(
  gameId: string,
  playerId: string,
  moveToPlay: ForecastStep,
  forecasts: ForecastStep[][],
): Promise<SaveResponse> {
  return fetchJSON(
    `/${gameId}${playerId}/forecasts/${moveToPlay.uci}`,
    {
      method: 'POST',
      body: JSON.stringify(forecasts),
    }
  )
}
