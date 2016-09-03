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
  replay: any
  actions: any
  newGameMenu: any
}

export interface AiRoundInterface extends OfflineRoundInterface {
  onEngineBestMove(bm: string): void
}
