import Replay from '../offlineRound/Replay';


export type Position = 'player' | 'opponent';
export type Material = { [role: string]: number; };

export interface RoundInterface {
  chessground: Chessground.Controller

  firstPly(): number
  lastPly(): number

  jump(ply: number): boolean
  jumpFirst(): boolean
  jumpNext(): boolean
  jumpPrev(): boolean
  jumpLast(): boolean
}

export interface OnlineRoundInterface extends RoundInterface {
  data: GameData
}

export interface OfflineRoundInterface extends RoundInterface {
  data: OfflineGameData
  replay: Replay
  actions: any
  newGameMenu: any

  onReplayAdded(sit: GameSituation): void
  onThreefoldRepetition(newStatus: GameStatus): void
  apply(sit: GameSituation): void
}

export interface AiRoundInterface extends OfflineRoundInterface {
  onEngineBestMove(bm: string): void
}
