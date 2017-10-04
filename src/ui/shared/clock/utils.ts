import { formatTimeInSecs } from '../../../utils'
import { ClockType, IChessClock, IStageClock } from './interfaces'

export function formatTime(clockType: ClockType, time: number) {
  if (clockType === 'hourglass') {
    return formatTimeInSecs(Math.round(time))
  } else {
    return formatTimeInSecs(Math.floor(time))
  }
}

export function isStageClock(c: IChessClock | IStageClock): c is IStageClock {
  return (c as IStageClock).whiteMoves !== undefined
}
