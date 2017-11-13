import { Game, Player, ClockData, CorrespondenceClockData } from './game'
import { Tree } from '../../ui/shared/tree'

export interface AnalyseData {
  game: Game
  player: Player
  opponent: Player
  orientation: Color
  spectator?: boolean // for compat with GameData, for game functions
  takebackable: boolean
  correspondence?: CorrespondenceClockData
  clock?: ClockData
  note?: string
  analysis?: RemoteEvalSummary
  userAnalysis: boolean
  tournament?: Tournament
  forecast?: any
  treeParts: Array<Partial<Tree.Node>>
  evalPut?: boolean
  // practiceGoal?: PracticeGoal
  pref: any
  // offline analyse don't have it
  url?: {
    round: string
    socket: string
  }
}

export interface OnlineAnalyseData extends AnalyseData {
  url: {
    round: string
    socket: string
  }
}
export function isOnlineAnalyseData(d: AnalyseData): d is OnlineAnalyseData {
  return (<OnlineAnalyseData>d).url !== undefined
}

export interface AnalyseDataWithTree extends AnalyseData {
  tree: Tree.Node
}

export interface Glyph {
  symbol: string
  name: string
}

export type CommentAuthor = string | { name: string }

export interface EvalJugdment {
  comment: string
  glyph: Glyph
  name: string
}

export interface RemoteEval {
  cp: number
  best?: string
  mate?: number
  variation?: string
  judgment?: EvalJugdment
}

interface PlayerEvalSummary {
  acpl: number
  blunder: number
  inaccuracy: number
  mistake: number
  [i: string]: number
}

export interface RemoteEvalSummary {
  white: PlayerEvalSummary
  black: PlayerEvalSummary
}

interface Tournament {
  id: string
  name: string
  running: boolean
}
