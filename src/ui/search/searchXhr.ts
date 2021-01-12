import { fetchJSON } from '../../http'
import { SearchQuery, SearchResult } from './interfaces'

export function search(query: SearchQuery, page = 1): Promise<SearchResult> {
  return fetchJSON('/games/search', {
    method: 'GET',
    query: Object.assign({}, query, { page })
  }, false)
}
