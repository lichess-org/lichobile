import { HumanSettings } from '../settings'
import { Session } from '../session'
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

export function makeRatingRange(user: Session, setup: HumanSeekSetup): string | null {
  const { ratingRangeMin, ratingRangeMax } = setup
  let perfKey: PerfKey = 'correspondence'
  switch (setup.variant) {
    case 1:
    case 3: {
      if (setup.timeMode === 1) {
        const time = setup.time * 60 + setup.increment * 40
        if (time < 30) perfKey = 'ultraBullet'
        else if (time < 180) perfKey = 'bullet'
        else if (time < 480) perfKey = 'blitz'
        else if (time < 1500) perfKey = 'rapid'
        else perfKey = 'classical'
      }
      break
    }
    case 2:
      perfKey = 'chess960'
      break
    case 4:
      perfKey = 'kingOfTheHill'
      break
    case 5:
      perfKey = 'threeCheck'
      break
    case 6:
      perfKey = 'antichess'
      break
    case 7:
      perfKey = 'atomic'
      break
    case 8:
      perfKey = 'horde'
      break
    case 9:
      perfKey = 'racingKings'
      break
    case 10:
      perfKey = 'crazyhouse'
      break
  }
  const perf = user.perfs[perfKey]
  if (perf && ratingRangeMin && ratingRangeMax) {
    return `${perf.rating + ratingRangeMin}-${perf.rating + ratingRangeMax}`
  } else {
    return null
  }
}
