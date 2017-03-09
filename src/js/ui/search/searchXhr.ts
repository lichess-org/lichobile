import { fetchJSON } from '../../http'
import { SearchQuery, SearchResult } from './interfaces'

export function search(query: SearchQuery): Promise<SearchResult> {
  return fetchJSON('/games/search', {
    method: 'GET',
    query
  }, true)
}
