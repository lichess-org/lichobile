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

/**
 * Minimum subset of AnalyseData that the forecast control needs to read and save forecasts.
 */
export interface AnalyseDataForForecast {
  readonly game: {
    readonly id: string
  },
  readonly player: {
    readonly id?: string | null
  },
  readonly forecast?: ForecastData,
  readonly url?: {
    readonly round: string
  }
}
