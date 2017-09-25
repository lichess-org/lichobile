import redraw from '../../../../utils/redraw'
import sound from '../../../../sound'

import { ClockType, Side, IStageClock, Stage, IChessStageClockState } from '../interfaces'

const CLOCK_TICK_STEP = 100
const MINUTE_MILLIS = 60 * 1000

export default function StageClock(stages: Stage[], increment: number): IStageClock {
  let state: IChessStageClockState = {
    topTime: Number(stages[0].time) * MINUTE_MILLIS,
    bottomTime: Number(stages[0].time) * MINUTE_MILLIS,
    topMoves: Number(stages[0].moves),
    bottomMoves: Number(stages[0].moves),
    topStage: 0,
    bottomStage: 0,
    stages: stages,
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
    if (state.activeSide === 'top') {
      const elapsed = now - topTimestamp
      topTimestamp = now
      state.topTime = Math.max(state.topTime - elapsed, 0)
      if (state.topTime <= 0) {
        state.flagged = 'top'
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    else if (state.activeSide === 'bottom') {
      const elapsed = now - bottomTimestamp
      bottomTimestamp = now
      state.bottomTime = Math.max(state.bottomTime - elapsed, 0)
      if (state.bottomTime <= 0) {
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

    const tm = state.topMoves
    const bm = state.bottomMoves

    if (side === 'top') {
      if (state.activeSide === 'top') {
        if (tm !== null)
          state.topMoves = tm - 1
        state.topTime = state.topTime + state.increment
        if (state.topMoves === 0) {
          state.topStage = state.topStage + 1
          state.topTime = state.topTime + Number(state.stages[state.topStage].time) * MINUTE_MILLIS
          if (state.topStage === (state.stages.length - 1))
            state.topMoves = null
          else
            state.topMoves = state.stages[state.topStage].moves
        }
      }
      bottomTimestamp = performance.now()
      state.activeSide = 'bottom'
    }
    else {
      if (state.activeSide === 'bottom') {
        if (bm !== null)
          state.bottomMoves = bm - 1
        state.bottomTime = state.bottomTime + state.increment
        if (state.bottomMoves === 0) {
          state.bottomStage = state.bottomStage + 1
          state.bottomTime = state.bottomTime + Number(state.stages[state.bottomStage].time) * MINUTE_MILLIS
          if (state.bottomStage === (state.stages.length - 1))
            state.bottomMoves = null
          else
            state.bottomMoves = state.stages[state.bottomStage].moves
        }
      }
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
    if (state.isRunning) {
      state.isRunning = false
      clearInterval(clockInterval)
    }
    else {
      state.isRunning = true
      clockInterval = setInterval(tick, CLOCK_TICK_STEP)
      if (state.activeSide === 'top') {
        topTimestamp = performance.now()
      } else {
        bottomTimestamp = performance.now()
      }
    }
  }

  function activeSide(): Side | undefined {
    return state.activeSide
  }

  function flagged(): Side | undefined {
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

  function topMoves(): number | null {
    return state.topMoves
  }

  function bottomMoves(): number | null {
    return state.bottomMoves
  }

  function topTime() : number{
    return state.topTime
  }

  function bottomTime(): number {
    return state.bottomTime
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
    topTime,
    bottomTime,
    topMoves,
    bottomMoves,
    clear() {
      clearInterval(clockInterval)
    }
  }
}
