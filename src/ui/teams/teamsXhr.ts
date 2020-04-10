import { fetchJSON } from '../../http'

export function getTeams(): Promise<ReadonlyArray<string>> {
  return fetchJSON('/team')
}
