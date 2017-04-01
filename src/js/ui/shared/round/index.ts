import Replay from '../offlineRound/Replay'
import { OnlineGameData, OfflineGameData, GameData, GameStatus } from '../../../lichess/interfaces/game'
import { GameSituation } from '../../../chess'

export type Position = 'player' | 'opponent'
export type Material = { [role: string]: number }

export interface BoardInterface {
  chessground: Chessground.Controller
  canDrop(): boolean
}

export interface PromotingInterface {
  chessground: Chessground.Controller
  data: GameData
  player: () => Color
}

export interface RoundInterface extends BoardInterface {
  firstPly(): number
  lastPly(): number

  jump(ply: number): boolean
  jumpFirst(): boolean
  jumpNext(): boolean
  jumpPrev(): boolean
  jumpLast(): boolean
}

export interface OnlineRoundInterface extends RoundInterface {
  data: OnlineGameData

  reload(cfg: OnlineGameData): void
  sendMove(orig: Pos, dest: Pos, prom: Role, isPremove?: boolean): void
}

export interface OfflineRoundInterface extends RoundInterface {
  data: OfflineGameData
  replay: Replay
  actions: any
  newGameMenu: any

  startNewGame(variant: VariantKey, setupFen?: string): void
  save(): void
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
