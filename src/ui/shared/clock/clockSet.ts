import settings from '../../../settings'
import HandicapIncClock from './clocks/HandicapIncClock'
import DelayClock from './clocks/DelayClock'
import BronsteinClock from './clocks/BronsteinClock'
import HourglassClock from './clocks/HourglassClock'
import StageClock from './clocks/StageClock'
import { MILLIS, MINUTE_MILLIS } from './utils'

function SimpleClock(time: number, onFlag: (color: Color) => void) {
  return IncrementClock(time, 0, onFlag)
}

function IncrementClock(time: number, increment: number, onFlag: (color: Color) => void) {
  return HandicapIncClock(time, increment, time, increment, onFlag, true)
}

export default {
  simple: (onFlag: (color: Color) => void) => SimpleClock(
    Number(settings.clock.simple.time()) * MINUTE_MILLIS,
    onFlag
  ),

  increment: (onFlag: (color: Color) => void) => IncrementClock(
    Number(settings.clock.increment.time()) * MINUTE_MILLIS,
    Number(settings.clock.increment.increment()) * MILLIS,
    onFlag
  ),

  handicapInc: (onFlag: (color: Color) => void) => HandicapIncClock(
    Number(settings.clock.handicapInc.topTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.topIncrement()) * MILLIS,
    Number(settings.clock.handicapInc.bottomTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.bottomIncrement()) * MILLIS,
    onFlag,
    true
  ),

  delay: (onFlag: (color: Color) => void) => DelayClock(
    Number(settings.clock.delay.time()) * MINUTE_MILLIS,
    Number(settings.clock.delay.increment()) * MILLIS,
    onFlag,
    true
  ),

  bronstein: (onFlag: (color: Color) => void) => BronsteinClock(
    Number(settings.clock.bronstein.time()) * MINUTE_MILLIS,
    Number(settings.clock.bronstein.increment()) * MILLIS,
    onFlag,
    true
  ),

  hourglass: (onFlag: (color: Color) => void) => HourglassClock(
    Number(settings.clock.hourglass.time()) * MINUTE_MILLIS,
    onFlag,
    true
  ),

  stage: (onFlag: (color: Color) => void) => StageClock(
    settings.clock.stage.stages().map(s => {
      return {
        time: Number(s.time),
        moves: s.moves !== null ? Number(s.moves) : null
      }
    }),
    Number(settings.clock.stage.increment()) * MILLIS,
    onFlag,
    true
  )
}
