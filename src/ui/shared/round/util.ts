import { OnlineGameData, GameStep } from '../../../lichess/interfaces/game'
import { User } from '../../../lichess/interfaces/user'

export function firstPly(d: OnlineGameData): number {
  return d.steps[0].ply
}

export function lastPly(d: OnlineGameData): number {
  return d.steps[d.steps.length - 1].ply
}

export function plyStep(d: OnlineGameData, ply: number): GameStep {
  return d.steps[ply - firstPly(d)]
}

export function getWhiteBlack(d: OnlineGameData): Array<User | undefined> {
  const isWhite = d.player.color === 'white'
  const white = isWhite ? d.player.user : d.opponent.user
  const black = isWhite ? d.opponent.user : d.player.user
  return [white, black]
}