import { HumanSettings } from '../settings'
import { ModeId, TimeModeId, HumanSeekSetup } from './interfaces'

export function humanSetupFromSettings(settingsObj: HumanSettings): HumanSeekSetup {
  return {
    mode: Number(settingsObj.mode()) as ModeId,
    variant: Number(settingsObj.variant()),
    timeMode: Number(settingsObj.timeMode()) as TimeModeId,
    time: Number(settingsObj.time()),
    increment: Number(settingsObj.increment()),
    days: Number(settingsObj.days()),
    color: settingsObj.color() as Color,
    ratingRangeMin: Number(settingsObj.ratingRangeMin()),
    ratingRangeMax: Number(settingsObj.ratingRangeMax())
  }
}
