import redraw from '../../../utils/redraw'
import sound from '../../../sound'
import * as stream from 'mithril/stream'

import { Side, IChessClock } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function HandicapIncClock(topTimeParam: number, topIncrement: number, bottomTimeParam: number, bottomIncrement: number): IChessClock {
  const topTime: Mithril.Stream<number> = (topTimeParam !== 0) ? stream(topTimeParam) : stream(topIncrement)
  const bottomTime: Mithril.Stream<number> = (bottomTimeParam !== 0) ? stream(bottomTimeParam) : stream(bottomIncrement)
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

    if (side === 'top') {
      if (activeSide() === 'top') {
        topTime(topTime() + topIncrement)
      }
      bottomTimestamp = performance.now()
      activeSide('bottom')
    } else if (side === 'bottom') {
      if (activeSide() === 'bottom') {
        bottomTime(bottomTime() + bottomIncrement)
      }
      topTimestamp = performance.now()
      activeSide('top')
    }
    clearInterval(clockInterval)
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
      if (activeSide() === 'top') {
        topTimestamp = performance.now()
      } else {
        bottomTimestamp = performance.now()
      }
      clockInterval = setInterval(tick, CLOCK_TICK_STEP)
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
    clear() {
      clearInterval(clockInterval)
    }
  }
}
