import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, Side, IChessClock, IChessHandicapIncClockState } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function HandicapIncClock(whiteTimeParam: number, whiteIncrement: number, blackTimeParam: number, blackIncrement: number): IChessClock {
  let state: IChessHandicapIncClockState = {
    whiteTime: (whiteTimeParam !== 0) ? whiteTimeParam : whiteIncrement,
    blackTime: (blackTimeParam !== 0) ? blackTimeParam : blackIncrement,
    whiteIncrement: whiteIncrement,
    blackIncrement: blackIncrement,
    activeSide: undefined,
    flagged: undefined,
    isRunning: false
  }
  
  let clockInterval: number
  let whiteTimestamp: number
  let blackTimestamp: number

  function tick () {
    const now = performance.now()
    if (activeSide() === 'white') {
      const elapsed = now - whiteTimestamp
      whiteTimestamp = now
      state.whiteTime = Math.max(state.whiteTime - elapsed, 0)
      if (whiteTime() <= 0) {
        state.flagged = 'white'
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    else if (activeSide() === 'black') {
      const elapsed = now - blackTimestamp
      blackTimestamp = now
      state.blackTime = Math.max(state.blackTime - elapsed, 0)
      if (blackTime() <= 0) {
        state.flagged = 'black'
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    redraw()
  }

  function clockHit(side: Side) {
    if (flagged()) {
      return
    }
    sound.clock()

    if (side === 'white') {
      if (activeSide() === 'white') {
        state.whiteTime = state.whiteTime + state.whiteIncrement
      }
      blackTimestamp = performance.now()
      state.activeSide = 'black'
    } else if (side === 'black') {
      if (activeSide() === 'black') {
        state.blackTime = state.blackTime + state.blackIncrement
      }
      whiteTimestamp = performance.now()
    state.activeSide = 'white'
    }
    clearInterval(clockInterval)
    clockInterval = setInterval(tick, CLOCK_TICK_STEP)
    state.isRunning = true
    redraw()
  }

  function startStop () {
    if (isRunning()) {
      state.isRunning = false
      clearInterval(clockInterval)
    }
    else {
      state.isRunning = true
      if (activeSide() === 'white') {
        whiteTimestamp = performance.now()
      } else {
        blackTimestamp = performance.now()
      }
      clockInterval = setInterval(tick, CLOCK_TICK_STEP)
    }
  }

  function activeSide(): Side | undefined {
     return state.activeSide;
  }

  function flagged(): Side | undefined {
     return state.flagged;
  }

  function isRunning(): boolean {
    return state.isRunning;
  }

  function getState(): IChessHandicapIncClockState {
    return state
  }

  function setState(newState: IChessHandicapIncClockState): void {
    state = newState
  }

  function whiteTime(): number {
    return state.whiteTime
  }

  function blackTime(): number {
    return state.blackTime
  }

  const clockType: ClockType = 'handicapInc'

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
    clear() {
      clearInterval(clockInterval)
    }
  }
}
