import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, Side, IChessClock, IChessHandicapIncClockState } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function HandicapIncClock(topTimeParam: number, topIncrement: number, bottomTimeParam: number, bottomIncrement: number): IChessClock {
  let state: IChessHandicapIncClockState = {
    topTime: (topTimeParam !== 0) ? topTimeParam : topIncrement,
    bottomTime: (bottomTimeParam !== 0) ? bottomTimeParam : bottomIncrement,
    topIncrement: topIncrement,
    bottomIncrement: bottomIncrement,
    activeSide: undefined,
    flagged: undefined,
    isRunning: false
  }
  
  let clockInterval: number
  let topTimestamp: number
  let bottomTimestamp: number

  function tick () {
    const now = performance.now()
    if (activeSide() === 'top') {
      const elapsed = now - topTimestamp
      topTimestamp = now
      state.topTime = Math.max(state.topTime - elapsed, 0)
      if (topTime() <= 0) {
        state.flagged = 'top'
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    else if (activeSide() === 'bottom') {
      const elapsed = now - bottomTimestamp
      bottomTimestamp = now
      state.bottomTime = Math.max(state.bottomTime - elapsed, 0)
      if (bottomTime() <= 0) {
        state.flagged = 'bottom'
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

    if (side === 'top') {
      if (activeSide() === 'top') {
        state.topTime = state.topTime + state.topIncrement
      }
      bottomTimestamp = performance.now()
      state.activeSide = 'bottom'
    } else if (side === 'bottom') {
      if (activeSide() === 'bottom') {
        state.bottomTime = state.bottomTime + state.bottomIncrement
      }
      topTimestamp = performance.now()
    state.activeSide = 'top'
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
      if (activeSide() === 'top') {
        topTimestamp = performance.now()
      } else {
        bottomTimestamp = performance.now()
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

  function topTime(): number {
    return state.topTime
  }

  function bottomTime(): number {
    return state.bottomTime
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
    topTime,
    bottomTime,
    clear() {
      clearInterval(clockInterval)
    }
  }
}
