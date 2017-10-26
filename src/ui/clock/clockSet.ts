import settings from '../../settings'
import HandicapIncClock from '../shared/clock/clocks/HandicapIncClock'
import DelayClock from '../shared/clock/clocks/DelayClock'
import BronsteinClock from '../shared/clock/clocks/BronsteinClock'
import HourglassClock from '../shared/clock/clocks/HourglassClock'
import StageClock from '../shared/clock/clocks/StageClock'
import { noop } from '../../utils'
import { MILLIS, MINUTE_MILLIS } from '../shared/clock/utils'

function SimpleClock(time: number, onFlag: () => void) {
  return IncrementClock(time, 0, onFlag)
}

function IncrementClock(time: number, increment: number, onFlag: () => void) {
  return HandicapIncClock(time, increment, time, increment, onFlag, true)
}

export default {
  none: () => null,

  simple: () => SimpleClock(
    Number(settings.clock.simple.time()) * MINUTE_MILLIS,
    noop
  ),

  increment: () => IncrementClock(
    Number(settings.clock.increment.time()) * MINUTE_MILLIS,
    Number(settings.clock.increment.increment()) * MILLIS,
    noop
  ),

  handicapInc: () => HandicapIncClock(
    Number(settings.clock.handicapInc.topTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.topIncrement()) * MILLIS,
    Number(settings.clock.handicapInc.bottomTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.bottomIncrement()) * MILLIS,
    noop,
    true
  ),

  delay: () => DelayClock(
    Number(settings.clock.delay.time()) * MINUTE_MILLIS,
    Number(settings.clock.delay.increment()) * MILLIS,
    noop,
    true
  ),

  bronstein: () => BronsteinClock(
    Number(settings.clock.bronstein.time()) * MINUTE_MILLIS,
    Number(settings.clock.bronstein.increment()) * MILLIS,
    noop,
    true
  ),

  hourglass: () => HourglassClock(
    Number(settings.clock.hourglass.time()) * MINUTE_MILLIS,
    noop,
    true
  ),

  stage: () => StageClock(
    settings.clock.stage.stages().map((s: { time: string, moves: string }) => {
      return {
        time: Number(s.time),
        moves: s.moves !== null ? Number(s.moves) : null
      }
    }),
    Number(settings.clock.stage.increment()) * MILLIS,
    noop,
    true
  )
}
