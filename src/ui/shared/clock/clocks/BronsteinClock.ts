import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, Side, IChessClock, IChessDelayClockState } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function BronsteinClock(time: number, increment: number): IChessClock {
  let state: IChessDelayClockState = {
    whiteTime: (time !== 0) ? time : increment,
    blackTime: (time !== 0) ? time : increment,
    whiteDelay: increment,
    blackDelay: increment,
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
      state.whiteDelay = Math.max(state.whiteDelay - elapsed, 0)
      if (state.whiteTime <= 0) {
        state.flagged = 'white'
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    else if (activeSide() === 'black') {
      const elapsed = now - blackTimestamp
      blackTimestamp = now
      state.blackTime = Math.max(state.blackTime - elapsed, 0)
      state.blackDelay = Math.max(state.blackDelay - elapsed, 0)
      if (state.blackTime <= 0) {
        state.flagged = 'black'
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    redraw()
  }

  function clockHit(side: Side) {
    if (state.flagged) {
      return
    }
    sound.clock()

    if (side === 'white') {
      if (state.activeSide === 'white') {
        state.activeSide = 'black'
        state.whiteTime = state.whiteTime + (state.increment - state.whiteDelay)
        state.whiteDelay = state.increment
      }
      blackTimestamp = performance.now()
      state.activeSide = 'black'
    }
    else {
      if (state.activeSide === 'black') {
        state.activeSide = 'white'
        state.blackTime = state.blackTime + (state.increment - state.blackDelay)
        state.blackDelay = state.increment
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

  function activeSide(): Side | undefined {
    return state.activeSide;
  }

  function flagged(): Side | undefined {
    return state.flagged;
  }

  function isRunning(): boolean {
    return state.isRunning;
  }

  function getState(): IChessDelayClockState {
    return state
  }

  function setState(newState: IChessDelayClockState): void {
    state = newState
  }

  function whiteTime(): number {
    return state.whiteTime
  }

  function blackTime(): number {
    return state.blackTime
  }

  const clockType: ClockType = 'bronstein'

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
