import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { Side, IChessClock, IChessBasicClockState } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function HourglassClock(time: number): IChessClock {
  let state: IChessBasicClockState = {
    topTime: time/2,
    bottomTime: time/2,
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
      state.bottomTime = time - state.topTime
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
      state.topTime = time - state.bottomTime
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
      bottomTimestamp = performance.now()
      state.activeSide = 'bottom'
    }
    else {
      topTimestamp = performance.now()
      state.activeSide = 'top'
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
      if (activeSide() === 'top') {
        topTimestamp = performance.now()
      } else {
        bottomTimestamp = performance.now()
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

  function getState(): IChessBasicClockState {
    return state
  }

  function setState(newState: IChessBasicClockState): void {
    state = newState
  }

  function topTime(): number {
    return state.topTime
  }

  function bottomTime(): number {
    return state.bottomTime
  }

  return {
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
