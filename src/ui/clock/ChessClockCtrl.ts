import { prop, Prop } from '~/utils'
import router from '../../router'
import settings from '../../settings'
import clockSettings from './clockSettings'

import clockSet from '../shared/clock/clockSet'
import { ClockType, IChessClock } from '../shared/clock/interfaces'

export interface IChessClockCtrl {
  startStop: () => void
  clockSettingsCtrl: any
  clockObj: Prop<IChessClock>
  reload: () => void
  goHome: () => void
  clockTap: (side: 'white' | 'black') => void
  clockType: Prop<ClockType>
  getMove: () => number
}

function noop() { /* noop */ }

export default function ChessClockCtrl(): IChessClockCtrl {

  const clockType: Prop<ClockType> = prop(settings.clock.clockType())
  const clockObj: Prop<IChessClock> = prop(clockSet[clockType()](noop))
  let currentMove: number= 1
  
  function reload() {
    if (clockObj() && clockObj().isRunning() && !clockObj().flagged()) return
    clockType(settings.clock.clockType())
    clockObj(clockSet[clockType()](noop))
    currentMove = 1
  }

  const clockSettingsCtrl = clockSettings.controller(reload, clockObj)

  function clockTap(side: 'white' | 'black') {
    clockObj().clockHit(side)
    currentMove += 0.5
  }

  function startStop () {
    clockObj().startStop()
  }

  function goHome() {
    if (!clockObj().isRunning() || clockObj().flagged()) {
      router.set('/')
    }
  }

  function getMove() {
    return Math.floor(currentMove)
  }

  return {
    startStop,
    clockSettingsCtrl,
    clockObj,
    reload,
    goHome,
    clockTap,
    clockType,
    getMove
  }
}
