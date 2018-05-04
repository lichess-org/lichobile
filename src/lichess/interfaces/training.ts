import { Tree } from '../../ui/shared/tree'

export interface PuzzleData {
  readonly puzzle: Puzzle
  game: Game
  user?: UserData
}

export interface PuzzleSyncData {
  readonly puzzles: ReadonlyArray<PuzzleData>
  readonly user: UserData
}

export interface Round {
  readonly win: boolean
  readonly userRatingDiff: number
}

export interface RoundData {
  readonly round: Round
  readonly user?: UserData
  readonly voted: boolean | null
}

export interface Game {
  readonly id: string
  readonly clock: string
  readonly perf: {
    readonly icon: string
    readonly name: string
  }
  readonly players: [Player, Player]
  readonly rated: boolean
  readonly treeParts: Tree.Node
}

export interface Player {
  readonly color: Color
  readonly name: string
  readonly userId: string
}

export interface Puzzle {
  readonly id: number
  readonly rating: number
  readonly attempts: number
  readonly fen: string
  readonly color: Color
  readonly initialMove: KeyPair
  readonly initialPly: number
  readonly gameId: string
  readonly lines: Lines
  readonly enabled: boolean
  readonly vote: number
  readonly branch: Tree.Node
}

export interface PuzzleOutcome {
  id: number
  win: boolean
}

//                       [id, diff, rating]
type RecentPuzzleStats = [number, number, number]

export interface UserData {
  readonly recent: ReadonlyArray<RecentPuzzleStats>
  readonly rating: number
}

export type LineFeedback = 'win' | 'retry'
export type Line = Lines | LineFeedback
export type Lines = { [uci: string]: Line }
