import settings from '../../settings'
import HandicapIncClock from '../shared/clock/clocks/HandicapIncClock'
import DelayClock from '../shared/clock/clocks/DelayClock'
import BronsteinClock from '../shared/clock/clocks/BronsteinClock'
import HourglassClock from '../shared/clock/clocks/HourglassClock'
import StageClock from '../shared/clock/clocks/StageClock'
import { MILLIS, MINUTE_MILLIS } from '../shared/clock/utils'

function SimpleClock(time: number, onFlag: (color: Color) => void) {
  return IncrementClock(time, 0, onFlag)
}

function IncrementClock(time: number, increment: number, onFlag: (color: Color) => void) {
  return HandicapIncClock(time, increment, time, increment, onFlag, false)
}

export default {
  none: (_: (color: Color) => void) => null,

  simple: (onFlag: (color: Color) => void) => SimpleClock(
    Number(settings.otb.clock.simple.time()) * MINUTE_MILLIS,
    onFlag
  ),

  increment: (onFlag: (color: Color) => void) => IncrementClock(
    Number(settings.otb.clock.increment.time()) * MINUTE_MILLIS,
    Number(settings.otb.clock.increment.increment()) * MILLIS,
    onFlag
  ),

  handicapInc: (onFlag: (color: Color) => void) => HandicapIncClock(
    Number(settings.otb.clock.handicapInc.topTime()) * MINUTE_MILLIS,
    Number(settings.otb.clock.handicapInc.topIncrement()) * MILLIS,
    Number(settings.otb.clock.handicapInc.bottomTime()) * MINUTE_MILLIS,
    Number(settings.otb.clock.handicapInc.bottomIncrement()) * MILLIS,
    onFlag,
    false
  ),

  delay: (onFlag: (color: Color) => void) => DelayClock(
    Number(settings.otb.clock.delay.time()) * MINUTE_MILLIS,
    Number(settings.otb.clock.delay.increment()) * MILLIS,
    onFlag,
    false
  ),

  bronstein: (onFlag: (color: Color) => void) => BronsteinClock(
    Number(settings.otb.clock.bronstein.time()) * MINUTE_MILLIS,
    Number(settings.otb.clock.bronstein.increment()) * MILLIS,
    onFlag,
    false
  ),

  hourglass: (onFlag: (color: Color) => void) => HourglassClock(
    Number(settings.otb.clock.hourglass.time()) * MINUTE_MILLIS,
    onFlag,
    false
  ),

  stage: (onFlag: (color: Color) => void) => StageClock(
    settings.otb.clock.stage.stages().map((s: { time: string, moves: string }) => {
      return {
        time: Number(s.time),
        moves: s.moves !== null ? Number(s.moves) : null
      }
    }),
    Number(settings.otb.clock.stage.increment()) * MILLIS,
    onFlag,
    false
  )
}
