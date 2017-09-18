import settings from '../../settings'
import HandicapIncClock from './clocks/HandicapIncClock'
import DelayClock from './clocks/DelayClock'
import BronsteinClock from './clocks/BronsteinClock'
import HourglassClock from './clocks/HourglassClock'
import StageClock from './clocks/StageClock'

const MILLIS = 1000
const MINUTE_MILLIS = 60 * 1000

function SimpleClock(time: number) {
  return IncrementClock(time, 0)
}

function IncrementClock(time: number, increment: number) {
  return HandicapIncClock(time, increment, time, increment)
}

export default {
  simple: () => SimpleClock(
    Number(settings.clock.simple.time()) * MINUTE_MILLIS
  ),

  increment: () => IncrementClock(
    Number(settings.clock.increment.time()) * MINUTE_MILLIS,
    Number(settings.clock.increment.increment()) * MILLIS
  ),

  handicapInc: () => HandicapIncClock(
    Number(settings.clock.handicapInc.topTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.topIncrement()) * MILLIS,
    Number(settings.clock.handicapInc.bottomTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.bottomIncrement()) * MILLIS
  ),

  delay: () => DelayClock(
    Number(settings.clock.delay.time()) * MINUTE_MILLIS,
    Number(settings.clock.delay.increment()) * MILLIS
  ),

  bronstein: () => BronsteinClock(
    Number(settings.clock.bronstein.time()) * MINUTE_MILLIS,
    Number(settings.clock.bronstein.increment()) * MILLIS
  ),

  hourglass: () => HourglassClock(
    Number(settings.clock.hourglass.time()) * MINUTE_MILLIS
  ),

  stage: () => StageClock(
    settings.clock.stage.stages().map((s: { time: string, moves: string }) => {
      return {
        time: Number(s.time),
        moves: s.moves !== null ? Number(s.moves) : null
      }
    }),
    Number(settings.clock.stage.increment()) * MILLIS
  )
}
