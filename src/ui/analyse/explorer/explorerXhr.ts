import { SESSION_ID_KEY, fetchJSON } from '../../../http'
import { OpeningData, TablebaseData } from './interfaces'

const explorerEndpoint = 'https://explorer.lichess.ovh'
const tablebaseEndpoint = 'https://tablebase.lichess.ovh'

export interface OpeningConf {
  db: string
  speeds?: string[]
  ratings?: number[]
}

export function openingXhr(variant: VariantKey, fen: string, config: OpeningConf, withGames: boolean): Promise<OpeningData> {
  const query: any = { fen, variant }
  if (!withGames) {
    query.topGames = 0
    query.recentGames = 0
  }
  if (config.db === 'lichess') {
    if (config.speeds) query.speeds = config.speeds.join(',')
    if (config.ratings) query.ratings = config.ratings.join(',')
  }
  return fetchJSON(explorerEndpoint + '/' + config.db, {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': '__delete',
      [SESSION_ID_KEY]: '__delete',
    },
    credentials: 'omit',
    query
  })
}

export function tablebaseXhr(variant: VariantKey, fen: string, timeout?: number): Promise<TablebaseData> {
  return fetchJSON(tablebaseEndpoint + '/' + variant, {
    headers: {
      'Accept': 'application/json, text/*',
      'X-Requested-With': '__delete',
      [SESSION_ID_KEY]: '__delete',
    },
    credentials: 'omit',
    query: {
      fen: fen
    },
    timeout
  })
}
