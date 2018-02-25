import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, IBasicClock, IChessBasicClockState } from '../interfaces'
import { CLOCK_TICK_STEP } from '../utils'

export default function HourglassClock(time: number, onFlag: (color: Color) => void, soundOn: boolean): IBasicClock {
  let state: IChessBasicClockState = {
    clockType: 'hourglass',
    whiteTime: time / 2,
    blackTime: time /   2,
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
      state.blackTime = time - state.whiteTime
      if (whiteTime() <= 0) {
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
      state.whiteTime = time - state.blackTime
      if (blackTime() <= 0) {
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

    if (side === 'white') {
      blackTimestamp = performance.now()
      state.activeSide = 'black'
    }
    else {
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
    if (isRunning()) {
      state.isRunning = false
      clearInterval(clockInterval)
    }
    else {
      state.isRunning = true
      clockInterval = setInterval(tick, CLOCK_TICK_STEP)
      if (activeSide() === 'white') {
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

  function getState(): IChessBasicClockState {
    return state
  }

  function setState(newState: IChessBasicClockState): void {
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

  const clockType: ClockType = 'hourglass'

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
