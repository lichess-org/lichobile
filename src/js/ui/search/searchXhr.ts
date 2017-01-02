import { UserGame } from '../../lichess/interfaces/user';
import { Paginator } from '../../lichess/interfaces';
import { fetchJSON } from '../../http';

export interface UserGameWithDate extends UserGame {
  date?: string
}

export interface FilterResult {
  paginator: Paginator<UserGameWithDate>
}

export function search(userId: string, filter = 'all', page = 1, feedback = false): Promise<FilterResult> {
  return fetchJSON(`/@/${userId}/${filter}`, {
    query: {
      page
    }
  }, feedback);
}
