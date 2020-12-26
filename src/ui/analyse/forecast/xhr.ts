import { fetchJSON } from '~/http'
import { ForecastData, ForecastStep } from '~/lichess/interfaces/forecast'

export function saveForecasts(
  gameId: string,
  playerId: string,
  forecasts: ForecastStep[][]
): Promise<ForecastData> {
  return fetchJSON(
    `/${gameId}${playerId}/forecasts`,
    {
      method: 'POST',
      body: JSON.stringify(forecasts),
    },
    true
  );
}
