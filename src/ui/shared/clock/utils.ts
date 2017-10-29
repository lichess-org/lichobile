import { formatTimeInSecs } from '../../../utils'
import { ClockType, IChessClock, IStageClock } from './interfaces'
import { SettingsProp } from '../../../settings'
import redraw from '../../../utils/redraw'

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

export function addStage (stagesSetting: SettingsProp<Array<{ time: string, moves: string | null}>>) {
  let stages = stagesSetting()
  stages[stages.length - 1].moves = stages[stages.length - 2].moves
  stages.push({time: stages[stages.length - 1].time, moves: null})
  stagesSetting(stages)
  redraw()
}

export function removeStage (stagesSetting: SettingsProp<Array<{ time: string, moves: string | null}>>) {
  let stages = stagesSetting()
  if (stages.length <= 2)
    return
  stages.pop()
  stagesSetting(stages)
  redraw()
}
