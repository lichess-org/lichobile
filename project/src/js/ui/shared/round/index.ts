
export interface RoundInterface {
  chessground: Chessground.Controller

  firstPly(): number
  lastPly(): number

  jump(ply: number): boolean
  jumpNext(): boolean
  jumpPrev(): boolean
  jumpLast(): boolean
}

export interface OnlineRoundInterface extends RoundInterface {
  data: GameData
}

export interface AiRoundInterface extends RoundInterface {
  data: OfflineGameData
  replay: any
  onEngineBestMove(bm: string): void
}
