import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, Side, IChessClock, IChessDelayClockState } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function DelayClock(time: number, increment: number): IChessClock {
  let state: IChessDelayClockState = {
    topTime: (time !== 0) ? time : increment,
    bottomTime: (time !== 0) ? time : increment,
    topDelay: increment,
    bottomDelay: increment,
    increment: increment,
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
      if (Math.floor(state.topDelay) > 0) {
        state.topDelay = state.topDelay - elapsed
      } else {
        state.topTime = Math.max(state.topTime - elapsed, 0)
        if (state.topTime <= 0) {
          state.flagged = 'top'
          sound.dong()
          clearInterval(clockInterval)
        }
      }
    }
    else if (activeSide() === 'bottom') {
      const elapsed = now - bottomTimestamp
      bottomTimestamp = now
      if (state.bottomDelay > 0) {
        state.bottomDelay = state.bottomDelay - elapsed
      } else {
        state.bottomTime = Math.max(state.bottomTime - elapsed, 0)
        if (bottomTime() <= 0) {
          state.flagged = 'bottom'
          sound.dong()
          clearInterval(clockInterval)
        }
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
      if (state.activeSide === 'top') {
        state.topDelay = state.increment
      }
      bottomTimestamp = performance.now()
      state.activeSide = 'bottom'
    } else if (side === 'bottom') {
      if (state.activeSide === 'bottom') {
        state.bottomDelay = state.increment
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
    if (state.isRunning) {
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

  function getState(): IChessDelayClockState {
    return state
  }

  function setState(newState: IChessDelayClockState): void {
    state = newState
  }

  function topTime(): number {
    return state.topTime
  }

  function bottomTime(): number {
    return state.bottomTime
  }

  const clockType: ClockType = 'delay'

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
