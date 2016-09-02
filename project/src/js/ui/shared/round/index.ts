
export interface RoundInterface {
  data: GameData
  chessground: Chessground.Controller

  firstPly(): number
  lastPly(): number

  jump(ply: number): boolean
  jumpNext(): boolean
  jumpPrev(): boolean
  jumpLast(): boolean
}
