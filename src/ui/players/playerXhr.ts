import { fetchJSON } from '../../http'
import { User, Rankings, SearchUser } from '../../lichess/interfaces/user'

type SearchResult = ReadonlyArray<SearchUser>

export async function autocomplete(term: string): Promise<SearchResult> {
  const data = await fetchJSON<{result: SearchResult}>('/player/autocomplete?friend=1&object=1', {
    query: { term },
  })
  return data.result
}

export function onlinePlayers(): Promise<ReadonlyArray<User>> {
  return fetchJSON('/player/online', { query: { nb: 50 }})
}

export function ranking(): Promise<Rankings> {
  return fetchJSON('/player')
}
