import settings from '../../settings'
import HandicapIncClock from '../shared/clock/clocks/HandicapIncClock'
import DelayClock from '../shared/clock/clocks/DelayClock'
import BronsteinClock from '../shared/clock/clocks/BronsteinClock'
import HourglassClock from '../shared/clock/clocks/HourglassClock'
import StageClock from '../shared/clock/clocks/StageClock'


const MILLIS = 1000
const MINUTE_MILLIS = 60 * 1000

function SimpleClock(time: number) {
  return IncrementClock(time, 0)
}

function IncrementClock(time: number, increment: number) {
  return HandicapIncClock(time, increment, time, increment)
}

export default {
  none: () => null,

  simple: () => SimpleClock(
    Number(settings.otb.clock.simple.time()) * MINUTE_MILLIS
  ),

  increment: () => IncrementClock(
    Number(settings.otb.clock.increment.time()) * MINUTE_MILLIS,
    Number(settings.otb.clock.increment.increment()) * MILLIS
  ),

  handicapInc: () => HandicapIncClock(
    Number(settings.otb.clock.handicapInc.topTime()) * MINUTE_MILLIS,
    Number(settings.otb.clock.handicapInc.topIncrement()) * MILLIS,
    Number(settings.otb.clock.handicapInc.bottomTime()) * MINUTE_MILLIS,
    Number(settings.otb.clock.handicapInc.bottomIncrement()) * MILLIS
  ),

  delay: () => DelayClock(
    Number(settings.otb.clock.delay.time()) * MINUTE_MILLIS,
    Number(settings.otb.clock.delay.increment()) * MILLIS
  ),

  bronstein: () => BronsteinClock(
    Number(settings.otb.clock.bronstein.time()) * MINUTE_MILLIS,
    Number(settings.otb.clock.bronstein.increment()) * MILLIS
  ),

  hourglass: () => HourglassClock(
    Number(settings.otb.clock.hourglass.time()) * MINUTE_MILLIS
  ),

  stage: () => StageClock(
    settings.otb.clock.stage.stages().map((s: { time: string, moves: string }) => {
      return {
        time: Number(s.time),
        moves: s.moves !== null ? Number(s.moves) : null
      }
    }),
    Number(settings.otb.clock.stage.increment()) * MILLIS
  )
}
