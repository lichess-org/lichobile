import { fetchJSON } from '../../http'
import { Team, TeamResults, TeamJoinLeaveResponse } from '../../lichess/interfaces/teams'

export function getTeam(id: string, disableCache?: boolean): Promise<Team> {
  return fetchJSON('/api/team/' + id, disableCache ? { cache: 'reload' } : undefined)
}

export function joinTeam(id: string, message: string | null): Promise<TeamJoinLeaveResponse> {
  return fetchJSON('/team/' + id + '/join',
  {
    method: 'POST',
    body: message ? JSON.stringify({message}) : null
  }, true)
}

export function leaveTeam(id: string): Promise<TeamJoinLeaveResponse> {
  return fetchJSON('/team/' + id + '/quit',
  {
    method: 'POST'
  }, true)
}

export function getPopularTeams(): Promise<TeamResults> {
  return fetchJSON('/api/team/all')
}

export function getUserTeams(userId: string): Promise<ReadonlyArray<Team>> {
  return fetchJSON('/api/team/of/' + userId)
}

export function search(term: string): Promise<TeamResults> {
  return fetchJSON('/api/team/search', { query: { text: term }})
}
