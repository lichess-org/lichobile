import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, IBasicClock, IChessDelayClockState } from '../interfaces'
import { CLOCK_TICK_STEP } from '../utils'

export default function BronsteinClock(time: number, increment: number, onFlag: (color: Color) => void, soundOn: boolean): IBasicClock {
  let state: IChessDelayClockState = {
    clockType: 'bronstein',
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
        onFlag(state.flagged)
        if (soundOn) sound.dong()
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
        onFlag(state.flagged)
        if (soundOn) sound.dong()
        clearInterval(clockInterval)
      }
    }
    redraw()
  }

  function clockHit(side: Color) {
    if (state.flagged) {
      return
    }
    if (soundOn) sound.clock()

    if (side === 'white') {
      if (state.activeSide === 'white') {
        state.whiteTime = state.whiteTime + (state.increment - state.whiteDelay)
        state.blackDelay = state.increment
      }
      blackTimestamp = performance.now()
      state.activeSide = 'black'
    }
    else {
      if (state.activeSide === 'black') {
        state.blackTime = state.blackTime + (state.increment - state.blackDelay)
        state.whiteDelay = state.increment
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

  function getTime(color: Color): number {
    return color === 'white' ? whiteTime() : blackTime()
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
    getTime,
    toggleActiveSide,
    clear() {
      clearInterval(clockInterval)
    }
  }
}
