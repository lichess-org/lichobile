import { UserFullProfile, GameFilter, UserGameWithDate, PerfStats } from '../../lichess/interfaces/user'
import { Paginator } from '../../lichess/interfaces'
import { OnlineGameData } from '../../lichess/interfaces/game'
import { Related } from '../../lichess/interfaces/user'
import { fetchJSON } from '../../http'

export interface FilterResult {
  filter: GameFilter
  paginator: Paginator<UserGameWithDate>
}

export interface RelatedResult {
  paginator: Paginator<Related>
}

export interface RelationActionResult {
  followable: boolean
  following: boolean
  blocking: boolean
}

export function games(userId: string, filter = 'all', page = 1, feedback = false): Promise<FilterResult> {
  return fetchJSON(`/@/${userId}/${filter}`, {
    query: {
      page
    }
  }, feedback)
}

export function following(userId: string, page = 1): Promise<RelatedResult> {
  return fetchJSON(`/@/${userId}/following`, {
    query: {
      page
    }
  })
}

export function followers(userId: string, page = 1): Promise<RelatedResult> {
  return fetchJSON(`/@/${userId}/followers`, {
    query: {
      page
    }
  })
}

export function follow(userId: string): Promise<RelationActionResult> {
  return fetchJSON('/rel/follow/' + userId, { method: 'POST' })
}

export function unfollow(userId: string): Promise<RelationActionResult> {
  return fetchJSON('/rel/unfollow/' + userId, { method: 'POST' })
}

export function block(userId: string): Promise<RelationActionResult> {
  return fetchJSON('/rel/block/' + userId, { method: 'POST' })
}

export function unblock(userId: string): Promise<RelationActionResult> {
  return fetchJSON('/rel/unblock/' + userId, { method: 'POST' })
}

export function user(id: string, feedback = true): Promise<UserFullProfile> {
  return fetchJSON(`/api/user/${id}`, undefined, feedback)
}

export function tv(userId: string): Promise<OnlineGameData> {
  return fetchJSON(`/@/${userId}/tv`)
}

export function variantperf(userId: string, perfKey: PerfKey): Promise<PerfStats> {
  return fetchJSON(`/@/${userId}/perf/${perfKey}?graph=1`, undefined, false)
}
