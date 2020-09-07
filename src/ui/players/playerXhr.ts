import { fetchJSON } from '../../http'
import { User, Rankings } from '../../lichess/interfaces/user'

export function autocomplete(term: string): Promise<ReadonlyArray<string>> {
  return fetchJSON('/player/autocomplete?friend=1', {
    query: { term },
  })
}

export function onlinePlayers(): Promise<ReadonlyArray<User>> {
  return fetchJSON('/player/online', { query: { nb: 50 }})
}

export function ranking(): Promise<Rankings> {
  return fetchJSON('/player')
}
