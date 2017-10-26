import { formatTimeInSecs } from '../../../utils'
import { ClockType, IChessClock, IStageClock } from './interfaces'

export const MILLIS = 1000
export const MINUTE_MILLIS = 60 * 1000
export const CLOCK_TICK_STEP = 100

export function formatTime(clockType: ClockType, time: number) {
  if (clockType === 'hourglass') {
    return formatTimeInSecs(Math.round(time))
  } else {
    return formatTimeInSecs(Math.floor(time))
  }
}

export function isStageClock(c: IChessClock): c is IStageClock {
  return (c as IStageClock).whiteMoves !== undefined
}
