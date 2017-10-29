import { Tree } from '../../ui/shared/tree'

export interface PuzzleData {
  puzzle: Puzzle
  game: Game
  user?: UserData
}

export interface Round {
  win: boolean
  userRatingDiff: number
}

export interface RoundData {
  round: Round
  user?: UserData
  voted: number | null
}

export interface Game {
  id: string
  clock: string
  perf: {
    icon: string
    name: string
  }
  players: [Player, Player]
  rated: boolean
  treeParts: Tree.Node
}

export interface Player {
  color: Color
  name: string
  userId: string
}

export interface Puzzle {
  id: number
  rating: number
  attempts: number
  fen: string
  color: Color
  initialMove: KeyPair
  initialPly: number
  gameId: string
  lines: Lines
  enabled: boolean
  vote: number
  branch: Tree.Node
}

export interface UserData {
  // [id, diff, rating]
  recent: Array<[number, number, number]>
  rating: number
}

export type LineFeedback = 'win' | 'retry'
export type Line = Lines | LineFeedback
export type Lines = { [uci: string]: Line }
