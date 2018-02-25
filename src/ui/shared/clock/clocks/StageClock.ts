import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, IStageClock, Stage, IChessStageClockState } from '../interfaces'
import { CLOCK_TICK_STEP, MINUTE_MILLIS} from '../utils'

export default function StageClock(stages: Stage[], increment: number, onFlag: (color: Color) => void, soundOn: boolean): IStageClock {
  let state: IChessStageClockState = {
    clockType: 'stage',
    whiteTime: Number(stages[0].time) * MINUTE_MILLIS,
    blackTime: Number(stages[0].time) * MINUTE_MILLIS,
    whiteMoves: Number(stages[0].moves),
    blackMoves: Number(stages[0].moves),
    whiteStage: 0,
    blackStage: 0,
    stages: stages,
    increment: increment,
    activeSide: undefined,
    flagged: undefined,
    isRunning: false
  }

  let clockInterval: number
  let whiteTimestamp: number
  let blackTimestamp: number

  function tick () {
    const now = performance.now()
    if (state.activeSide === 'white') {
      const elapsed = now - whiteTimestamp
      whiteTimestamp = now
      state.whiteTime = Math.max(state.whiteTime - elapsed, 0)
      if (state.whiteTime <= 0) {
        state.flagged = 'white'
        onFlag(state.flagged)
        if (soundOn) sound.dong()
        clearInterval(clockInterval)
      }
    }
    else if (state.activeSide === 'black') {
      const elapsed = now - blackTimestamp
      blackTimestamp = now
      state.blackTime = Math.max(state.blackTime - elapsed, 0)
      if (state.blackTime <= 0) {
        state.flagged = 'black'
        onFlag(state.flagged)
        if (soundOn) sound.dong()
        clearInterval(clockInterval)
      }
    }
    redraw()
  }

  function clockHit(side: Color) {
    if (flagged()) {
      return
    }
    if (soundOn) sound.clock()

    const tm = state.whiteMoves
    const bm = state.blackMoves

    if (side === 'white') {
      if (tm !== null)
        state.whiteMoves = tm - 1
      state.whiteTime = state.whiteTime + state.increment
      if (state.whiteMoves === 0) {
        state.whiteStage = state.whiteStage + 1
        state.whiteTime = state.whiteTime + Number(state.stages[state.whiteStage].time) * MINUTE_MILLIS
        if (state.whiteStage === (state.stages.length - 1))
          state.whiteMoves = null
        else
          state.whiteMoves = state.stages[state.whiteStage].moves
      }
      blackTimestamp = performance.now()
      state.activeSide = 'black'
    }
    else {
      if (bm !== null)
        state.blackMoves = bm - 1
      state.blackTime = state.blackTime + state.increment
      if (state.blackMoves === 0) {
        state.blackStage = state.blackStage + 1
        state.blackTime = state.blackTime + Number(state.stages[state.blackStage].time) * MINUTE_MILLIS
        if (state.blackStage === (state.stages.length - 1))
          state.blackMoves = null
        else
          state.blackMoves = state.stages[state.blackStage].moves
      }
      whiteTimestamp = performance.now()
      state.activeSide = 'white'
    }
    if (clockInterval) {
      clearInterval(clockInterval)
    }
    clockInterval = setInterval(tick, CLOCK_TICK_STEP)
    state.isRunning = true
    redraw()
  }

  function startStop () {
    if (state.isRunning) {
      state.isRunning = false
      clearInterval(clockInterval)
    }
    else {
      state.isRunning = true
      clockInterval = setInterval(tick, CLOCK_TICK_STEP)
      if (state.activeSide === 'white') {
        whiteTimestamp = performance.now()
      } else {
        blackTimestamp = performance.now()
      }
    }
  }

  function activeSide(): Color | undefined {
    return state.activeSide
  }

  function flagged(): Color | undefined {
    return state.flagged
  }

  function isRunning(): boolean {
    return state.isRunning
  }

  function getState(): IChessStageClockState {
    return state
  }

  function setState(newState: IChessStageClockState): void {
    state = newState
  }

  function whiteMoves(): number | null {
    return state.whiteMoves
  }

  function blackMoves(): number | null {
    return state.blackMoves
  }

  function whiteTime(): number {
    return state.whiteTime
  }

  function blackTime(): number {
    return state.blackTime
  }

  function getTime(color: Color): number {
    return color === 'white' ? whiteTime() : blackTime()
  }

  function getMoves(color: Color): number | null {
    return color === 'white' ? whiteMoves() : blackMoves()
  }

  function toggleActiveSide(): void {
    if (state.activeSide)
      if (state.activeSide === 'white') {
        blackTimestamp = performance.now()
        state.activeSide = 'black'
      }
      else {
        whiteTimestamp = performance.now()
        state.activeSide = 'white'
      }
  }

  const clockType: ClockType = 'stage'

  return {
    clockType,
    getState,
    setState,
    activeSide,
    flagged,
    isRunning,
    clockHit,
    startStop,
    whiteTime,
    blackTime,
    whiteMoves,
    blackMoves,
    getTime,
    getMoves,
    toggleActiveSide,
    clear() {
      clearInterval(clockInterval)
    }
  }
}
