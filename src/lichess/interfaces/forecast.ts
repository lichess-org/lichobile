export interface ForecastData {
  onMyTurn?: boolean
  steps?: ForecastStep[][]
}

/**
 * Subset of the full ForecastStep provided by the server.
 * This is the minimal subset of data required to compare forecast lines.
 */
export interface MinimalForecastStep {
  ply: Ply
  uci: Uci
}

export interface ForecastStep extends MinimalForecastStep {
  san: San
  fen: Fen
}
