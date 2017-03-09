import { fetchJSON } from '../../../http'

const explorerEndpoint = 'https://expl.lichess.org'
const tablebaseEndpoint = 'https://tablebase.lichess.org'

export function openingXhr(variant: VariantKey, fen: string, config: any, withGames: boolean) {
  let url: string
  const params: any = {
    fen,
    moves: 12
  }
  if (!withGames) {
    params.topGames = 0
    params.recentGames = 0
  }
  if (config.db.selected() === 'masters') url = '/master'
  else {
    url = '/lichess'
    params.variant = variant
    params['speeds[]'] = config.speed.selected()
    params['ratings[]'] = config.rating.selected()
  }
  return fetchJSON(explorerEndpoint + url, {
    headers: {
      'Accept': 'application/json, text/*'
    },
    query: params
  })
}

export function tablebaseXhr(variant: VariantKey, fen: string) {
  return fetchJSON(tablebaseEndpoint + '/' + variant, {
    headers: {
      'Accept': 'application/json, text/*'
    },
    query: {
      fen: fen
    }
  })
}
