import { fetchJSON } from '../../http'
import { User, Rankings, SearchUser } from '../../lichess/interfaces/user'

type SearchResult = ReadonlyArray<SearchUser>

export async function autocomplete(term: string): Promise<SearchResult> {
  const data = await fetchJSON<{result: SearchResult}>('/player/autocomplete?friend=1&object=1', {
    query: { term },
  })
  return data.result
}

export async function onlinePlayers(): Promise<ReadonlyArray<User>> {
  const data = await fetchJSON<Array<User>>('/player/online', { query: { nb: 50 } })
  data.forEach(user => user.online = true) // every player returned from this endpoint is implicitly online
  return data
}

export function ranking(): Promise<Rankings> {
  return fetchJSON('/player')
}
