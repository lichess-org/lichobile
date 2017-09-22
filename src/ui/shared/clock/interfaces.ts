
export type Side = 'top' | 'bottom'

export type ClockType = 'simple' | 'increment' | 'handicapInc' | 'delay' | 'bronstein' | 'hourglass' | 'stage'

export interface IChessClock {
  getState(): ClockState
  setState(state: ClockState): void
  topTime(): number
  bottomTime(): number
  activeSide(): Side | undefined
  flagged(): Side | undefined
  isRunning(): boolean
  clockHit(side: Side): void
  startStop(): void
  clear(): void
}

export interface Stage { time: number, moves: number | null }

export interface IStageClock extends IChessClock {
  topMoves(): number | null
  bottomMoves(): number | null
}

export interface IChessBasicClockState {
  topTime: number
  bottomTime: number
  activeSide: Side | undefined
  flagged: Side | undefined
  isRunning: boolean
}

export interface IChessHandicapIncClockState extends IChessBasicClockState {
  topIncrement: number
  bottomIncrement: number
}

export interface IChessDelayClockState extends IChessBasicClockState {
  topDelay: number
  bottomDelay: number
  increment: number
}

export interface IChessStageClockState extends IChessBasicClockState {
  topMoves: number | null
  bottomMoves: number | null
  topStage: number
  bottomStage: number
  stages: Stage[]
  increment: number
}

export type ClockState = IChessBasicClockState | IChessHandicapIncClockState | IChessDelayClockState | IChessStageClockState;