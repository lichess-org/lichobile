import { fetchJSON } from '../../http'
import { User, Rankings } from '../../lichess/interfaces/user'

export function autocomplete(term: string): Promise<Array<string>> {
  return fetchJSON('/player/autocomplete?friend=1', { query: { term }})
}

export function suggestions(userId: string) {
  return fetchJSON(`/@/${userId}/suggestions`, {}, true)
}

export function onlinePlayers(): Promise<Array<User>> {
  return fetchJSON('/player/online', { query: { nb: 100 }}, true)
}

export function ranking(): Promise<Rankings> {
  return fetchJSON('/player', {}, true)
}
