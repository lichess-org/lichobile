import { UserGame } from '../../lichess/interfaces/user';
import { Paginator } from '../../lichess/interfaces';
import { fetchJSON } from '../../http';
import { SearchQuery, SearchResult } from './interfaces'

export function search(query: SearchQuery): Promise<SearchResult> {
  return fetchJSON('/tournament/new', {
    method: 'GET',
    query
  }, true);
}
