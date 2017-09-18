
export type Side = 'top' | 'bottom'

export type ClockType = 'simple' | 'increment' | 'handicapInc' | 'delay' | 'bronstein' | 'hourglass' | 'stage'

export interface IChessClock {
  topTime: Mithril.Stream<number>
  bottomTime: Mithril.Stream<number>
  activeSide: Mithril.Stream<Side | undefined>
  flagged: Mithril.Stream<Side | undefined>
  isRunning: Mithril.Stream<boolean>
  clockHit(side: Side): void
  startStop(): void
  clear(): void
}

export interface Stage { time: number, moves: number | null }

export interface IStageClock extends IChessClock {
  topMoves: Mithril.Stream<number | null>
  bottomMoves: Mithril.Stream<number | null>
}
