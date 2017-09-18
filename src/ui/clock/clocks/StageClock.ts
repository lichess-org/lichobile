import redraw from '../../../utils/redraw'
import sound from '../../../sound'
import * as stream from 'mithril/stream'

import { Side, Stage, IStageClock } from '../interfaces'

const CLOCK_TICK_STEP = 100
const MINUTE_MILLIS = 60 * 1000

export default function StageClock(stages: Stage[], increment: number): IStageClock {
  const topTime: Mithril.Stream<number> = stream(Number(stages[0].time) * MINUTE_MILLIS)
  const bottomTime: Mithril.Stream<number> = stream(Number(stages[0].time) * MINUTE_MILLIS)
  const topMoves: Mithril.Stream<number | null> = stream(Number(stages[0].moves))
  const bottomMoves: Mithril.Stream<number | null> = stream(Number(stages[0].moves))
  const topStage: Mithril.Stream<number> = stream(0)
  const bottomStage: Mithril.Stream<number> = stream(0)
  const activeSide: Mithril.Stream<Side | undefined> = stream(undefined)
  const flagged: Mithril.Stream<Side | undefined> = stream(undefined)
  const isRunning: Mithril.Stream<boolean> = stream(false)
  let clockInterval: number
  let topTimestamp: number
  let bottomTimestamp: number

  function tick () {
    const now = performance.now()
    if (activeSide() === 'top') {
      const elapsed = now - topTimestamp
      topTimestamp = now
      topTime(Math.max(topTime() - elapsed, 0))
      if (topTime() <= 0) {
        flagged('top')
        sound.dong()
        clearInterval(clockInterval)
      }
    }
    else if (activeSide() === 'bottom') {
      const elapsed = now - bottomTimestamp
      bottomTimestamp = now
      bottomTime(Math.max(bottomTime() - elapsed, 0))
      if (bottomTime() <= 0) {
        flagged('bottom')
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

    const tm = topMoves()
    const bm = bottomMoves()

    if (side === 'top') {
      if (activeSide() === 'top') {
        if (tm !== null)
          topMoves(tm - 1)
        topTime(topTime() + increment)
        if (topMoves() === 0) {
          topStage(topStage() + 1)
          topTime(topTime() + Number(stages[topStage()].time) * MINUTE_MILLIS)
          if (topStage() === (stages.length - 1))
            topMoves(null)
          else
            topMoves(stages[topStage()].moves)
        }
      }
      bottomTimestamp = performance.now()
      activeSide('bottom')
    }
    else {
      if (activeSide() === 'bottom') {
        if (bm !== null)
          bottomMoves(bm - 1)
        bottomTime(bottomTime() + increment)
        if (bottomMoves() === 0) {
          bottomStage(bottomStage() + 1)
          bottomTime(bottomTime() + Number(stages[bottomStage()].time) * MINUTE_MILLIS)
          if (bottomStage() === (stages.length - 1))
            bottomMoves(null)
          else
            bottomMoves(stages[bottomStage()].moves)
        }
      }
      topTimestamp = performance.now()
      activeSide('top')
    }
    if (clockInterval) {
      clearInterval(clockInterval)
    }
    clockInterval = setInterval(tick, CLOCK_TICK_STEP)
    isRunning(true)
    redraw()
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false)
      clearInterval(clockInterval)
    }
    else {
      isRunning(true)
      clockInterval = setInterval(tick, CLOCK_TICK_STEP)
      if (activeSide() === 'top') {
        topTimestamp = performance.now()
      } else {
        bottomTimestamp = performance.now()
      }
    }
  }

  return {
    topTime,
    bottomTime,
    activeSide,
    flagged,
    isRunning,
    clockHit,
    startStop,
    topMoves,
    bottomMoves,
    clear() {
      clearInterval(clockInterval)
    }
  }
}
