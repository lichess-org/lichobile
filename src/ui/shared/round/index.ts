import Chessground from '../../../chessground/Chessground'
import Replay from '../offlineRound/Replay'
import { OnlineGameData, OfflineGameData, GameData, GameStatus } from '../../../lichess/interfaces/game'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import { GameSituation } from '../../../chess'
import { Data as TrainingData } from '../../training/interfaces'
import { ClockType } from '../clock/interfaces'

export type Position = 'player' | 'opponent'
export type Material = { pieces: { [k: string]: number }, score: number }

export interface BoardInterface {
  chessground: Chessground
  canDrop(): boolean
}

export interface PromotingInterface {
  chessground: Chessground
  data: GameData | AnalyseData | TrainingData
  player: () => Color
}

export interface RoundInterface extends BoardInterface {
  firstPly(): number
  lastPly(): number
  goToAnalysis(): void

  jump(ply: number): boolean
  jumpFirst(): boolean
  jumpNext(): boolean
  jumpPrev(): boolean
  jumpLast(): boolean
}

export interface OnlineRoundInterface extends RoundInterface {
  data: OnlineGameData

  onReload(cfg: OnlineGameData): void
  reloadGameData(): void
  sendMove(orig: Key, dest: Key, prom: Role, isPremove?: boolean): void
}

export interface OfflineRoundInterface extends RoundInterface {
  data: OfflineGameData
  replay: Replay
  actions: any
  newGameMenu: any
  moveList: boolean

  startNewGame(variant: VariantKey, setupFen?: string, clockType?: ClockType | 'none'): void
  save(): void
  sharePGN(): void
  onReplayAdded(sit: GameSituation): void
  onThreefoldRepetition(newStatus: GameStatus): void
  apply(sit: GameSituation): void
}

export interface AiVM {
  engineSearching: boolean
  setupFen?: string
  savedFen?: string
}
export interface AiRoundInterface extends OfflineRoundInterface {
  onEngineMove(bm: string): void
  onEngineDrop(bd: string): void
  resign(): void
  white(): string
  black(): string
  vm: AiVM
}

export interface OtbVM {
  flip: boolean
  setupFen?: string
  savedFen?: string
}
export interface OtbRoundInterface extends OfflineRoundInterface {
  vm: OtbVM
}
