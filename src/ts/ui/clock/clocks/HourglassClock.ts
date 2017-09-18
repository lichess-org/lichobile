import redraw from '../../../utils/redraw'
import sound from '../../../sound'
import * as stream from 'mithril/stream'

import { Side, IChessClock } from '../interfaces'

const CLOCK_TICK_STEP = 100

export default function HourglassClock(time: number): IChessClock {
  const topTime: Mithril.Stream<number> = stream(time / 2)
  const bottomTime: Mithril.Stream<number> = stream(time / 2)
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
      bottomTime(time - topTime())
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
      topTime(time - bottomTime())
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
      bottomTimestamp = performance.now()
      activeSide('bottom')
    }
    else {
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
    clear() {
      clearInterval(clockInterval)
    }
  }
}
