import { fetchJSON } from '../../http'
import { Team, TeamDetail, TeamJoinLeaveResponse } from '../../lichess/interfaces/teams'

export function getTeam(id: string): Promise<TeamDetail> {
  return fetchJSON('/api/team/' + id)
}

export function joinTeam(id: string): Promise<TeamJoinLeaveResponse> {
  return fetchJSON('/api/team/' + id + '/join',
  {
    method: 'POST'
  }, true)
}

export function leaveTeam(id: string): Promise<TeamJoinLeaveResponse> {
  return fetchJSON('/api/team/' + id + '/quit',
  {
    method: 'POST'
  }, true)
}

export function getPopularTeams(): Promise<ReadonlyArray<Team>> {
  return fetchJSON('/api/team/all')
}

export function getUserTeams(userId: string): Promise<ReadonlyArray<Team>> {
  return fetchJSON('/api/team/of/' + userId)
}

export function search(term: string): Promise<ReadonlyArray<Team>> {
  return fetchJSON('/api/team/search', { query: { text: term }})
}