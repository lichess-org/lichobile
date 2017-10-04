
export type Side = 'white' | 'black'

export type ClockType = 'simple' | 'increment' | 'handicapInc' | 'delay' | 'bronstein' | 'hourglass' | 'stage'

export interface IChessClock {
  clockType: ClockType
  getState(): ClockState
  setState(state: ClockState): void
  whiteTime(): number
  blackTime(): number
  activeSide(): Side | undefined
  flagged(): Side | undefined
  isRunning(): boolean
  clockHit(side: Side): void
  startStop(): void
  clear(): void
}

export interface Stage { time: number, moves: number | null }

export interface IStageClock extends IChessClock {
  whiteMoves(): number | null
  blackMoves(): number | null
}

export interface IChessBasicClockState {
  clockType: ClockType
  whiteTime: number
  blackTime: number
  activeSide: Side | undefined
  flagged: Side | undefined
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

export type ClockState = IChessBasicClockState | IChessHandicapIncClockState | IChessDelayClockState | IChessStageClockState;

export interface AntagonistTimeData {
  clockType: ClockType
  time: number
  moves: number | null
}
