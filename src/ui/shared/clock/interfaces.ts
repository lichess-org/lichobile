export type ClockType = 'simple' | 'increment' | 'handicapInc' | 'delay' | 'bronstein' | 'hourglass' | 'stage'

export interface IBasicClock {
  clockType: ClockType
  getState(): ClockState
  setState(state: ClockState): void
  whiteTime(): number
  blackTime(): number
  getTime(color: Color): number
  activeSide(): Color | undefined
  flagged(): Color | undefined
  isRunning(): boolean
  clockHit(side: Color): void
  startStop(): void
  clear(): void
  toggleActiveSide(): void
}

export interface Stage { time: number, moves: number | null }

export interface StageSetting { time: string, moves: string | null }

export interface IStageClock extends IBasicClock {
  whiteMoves(): number | null
  blackMoves(): number | null
  getMoves(color: Color): number | null
}

export type IChessClock = IBasicClock | IStageClock

export interface IChessBasicClockState {
  clockType: ClockType
  whiteTime: number
  blackTime: number
  activeSide: Color | undefined
  flagged: Color | undefined
  isRunning: boolean
}

export interface IChessHandicapIncClockState extends IChessBasicClockState {
  whiteIncrement: number
  blackIncrement: number
}

export interface IChessDelayClockState extends IChessBasicClockState {
  whiteDelay: number
  blackDelay: number
  increment: number
}

export interface IChessStageClockState extends IChessBasicClockState {
  whiteMoves: number | null
  blackMoves: number | null
  whiteStage: number
  blackStage: number
  stages: Stage[]
  increment: number
}

export type ClockState = IChessBasicClockState | IChessHandicapIncClockState | IChessDelayClockState | IChessStageClockState | null
