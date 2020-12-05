import { Game, Player, ClockData, CorrespondenceClockData, OnlinePref } from './game'
import { Tree } from '../../ui/shared/tree'

export interface AnalyseData {
  bookmarked?: boolean
  readonly game: Game
  readonly player: Player
  readonly opponent: Player
  orientation: Color
  readonly spectator?: boolean // for compat with GameData, for game functions
  readonly takebackable: boolean
  readonly correspondence?: CorrespondenceClockData
  readonly clock?: ClockData
  note?: string
  analysis?: RemoteEvalSummary
  readonly userAnalysis: boolean
  readonly tournament?: Tournament
  readonly forecast?: any
  treeParts: Array<Partial<Tree.Node>>
  readonly evalPut?: boolean
  // practiceGoal?: PracticeGoal
  readonly pref: any
  // study and offline analyse don't have it
  readonly url?: {
    readonly round: string
    readonly socket: string
  }
}

export interface OnlineAnalyseData extends AnalyseData {
  readonly pref: OnlinePref
  readonly url: {
    readonly round: string
    readonly socket: string
  }
}
export function isOnlineAnalyseData(d: AnalyseData): d is OnlineAnalyseData {
  return (<OnlineAnalyseData>d).url !== undefined
}

export interface AnalyseDataWithTree extends AnalyseData {
  readonly tree: Tree.Node
}

export interface Glyph {
  readonly symbol: string
  readonly name: string
}

export type CommentAuthor = string | { name: string }

export interface EvalJugdment {
  readonly comment: string
  readonly glyph: Glyph
  readonly name: string
}

export interface RemoteEval {
  readonly cp: number
  readonly best?: string
  readonly mate?: number
  readonly variation?: string
  readonly judgment?: EvalJugdment
}

interface PlayerEvalSummary {
  readonly acpl: number
  readonly blunder: number
  readonly inaccuracy: number
  readonly mistake: number
  readonly [i: string]: number
}

export interface RemoteEvalSummary {
  readonly white: PlayerEvalSummary
  readonly black: PlayerEvalSummary
}

interface Tournament {
  readonly id: string
  readonly name: string
  readonly running: boolean
}
