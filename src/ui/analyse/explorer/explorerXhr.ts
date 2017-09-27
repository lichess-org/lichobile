import { fetchJSON } from '../../../http'
import { ExplorerData } from './interfaces'

const explorerEndpoint = 'https://expl.lichess.org'
const tablebaseEndpoint = 'https://tablebase.lichess.org'

export interface OpeningConf {
  db: string
  speeds?: string[]
  ratings?: number[]
}

export function openingXhr(variant: VariantKey, fen: string, config: OpeningConf, withGames: boolean): Promise<ExplorerData> {
  let url: string
  const params: any = {
    fen,
    moves: 12
  }
  if (!withGames) {
    params.topGames = 0
    params.recentGames = 0
  }
  if (config.db === 'masters') url = '/master'
  else {
    url = '/lichess'
    params.variant = variant
    params['speeds[]'] = config.speeds
    params['ratings[]'] = config.ratings
  }
  return fetchJSON(explorerEndpoint + url, {
    headers: {
      'Accept': 'application/json, text/*'
    },
    query: params
  })
}

export function tablebaseXhr(variant: VariantKey, fen: string): Promise<ExplorerData> {
  return fetchJSON(tablebaseEndpoint + '/' + variant, {
    headers: {
      'Accept': 'application/json, text/*'
    },
    query: {
      fen: fen
    }
  })
}
