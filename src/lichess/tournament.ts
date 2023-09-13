import { Tournament } from './interfaces/tournament'

export function isIn(data: Tournament): boolean {
  return !!(data.me && !data.me.withdraw)
}

export function previouslyJoined(data: Tournament): boolean {
  return !!data.me
}
