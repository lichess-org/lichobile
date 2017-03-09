import * as helper from '../helper'
import layout from '../layout'
import clockSettings from './clockSettings'
import { formatTimeInSecs } from '../../utils'

export default function view() {
  const ctrl = this
  const body = clockBody.bind(undefined, ctrl)
  const clockSettingsOverlay = renderClockSettingsOverlay.bind(undefined, ctrl)

  return layout.clock(body, clockSettingsOverlay)
}

function renderClockSettingsOverlay(ctrl) {
  return [
    clockSettings.view(ctrl.clockSettingsCtrl)
  ]
}

function formatTime(type, time) {
  if (type === 'hourglass') {
    return formatTimeInSecs(Math.round(time))
  } else {
    return formatTimeInSecs(Math.floor(time))
  }
}

function clockBody(ctrl) {
  const clock = ctrl.clockObj()
  if (!clock) return null
  const topActive = clock.activeSide() === 'top'
  const bottomActive = clock.activeSide() === 'bottom'
  const topFlagged = clock.flagged() === 'top'
  const bottomFlagged = clock.flagged() === 'bottom'
  const flagged = topFlagged || bottomFlagged

  const topClockClass = [
    'clockTapArea',
    'top',
    topActive ? 'active' : '',
    clock.isRunning() ? 'running' : '',
    topFlagged ? 'flagged' : ''
  ].join(' ')

  const bottomClockClass = [
    'clockTapArea',
    'bottom',
    bottomActive ? 'active' : '',
    clock.isRunning() ? 'running' : '',
    bottomFlagged ? 'flagged' : ''
  ].join(' ')

  const topClockTimeClass = [
    'clockTime',
    topFlagged ? 'flagged' : '',
    clock.topTime() >= 3600 ? 'long' : ''
  ].join(' ')

  const bottomClockTimeClass = [
    'clockTime',
    bottomFlagged ? 'flagged' : '',
    clock.bottomTime() >= 3600 ? 'long' : ''
  ].join(' ')

  return (
    <div className="clockContainer">
      <div key="topClockTapArea" className={topClockClass} oncreate={helper.ontouch(() => onClockTouch(ctrl, 'top'))}>
        { clock.topMoves && clock.topMoves() !== null ?
        <div className="clockStageInfo">
          <span>Moves remaining: {clock.topMoves()}</span>
        </div> : null
        }
        <div className="clockTapAreaContent">
          <span className={topClockTimeClass}>
            { topFlagged ? 'b' : formatTime(ctrl.clockType(), clock.topTime() / 1000) }
          </span>
        </div>
      </div>
      <div className="clockControls">
        { !flagged && clock.activeSide() ? <span key="running-play-pause" className={'fa' + (clock.isRunning() ? ' fa-pause' : ' fa-play')} oncreate={helper.ontap(() => ctrl.startStop())} /> : <span key="disabled-pause" className="fa fa-pause disabled" /> }
        <span key="refresh" className={'fa fa-refresh' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.reload)} />
        <span key="settings" className={'fa fa-cog' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.clockSettingsCtrl.open)} />
        <span hey="home" className={'fa fa-home' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.goHome)} />
      </div>
      <div key="bottomClockTapArea" className={bottomClockClass} oncreate={helper.ontouch(() => onClockTouch(ctrl, 'bottom'))}>
        <div className="clockTapAreaContent">
          <span className={bottomClockTimeClass}>
            { bottomFlagged ? 'b' : formatTime(ctrl.clockType(), clock.bottomTime() / 1000) }
          </span>
        </div>
        { clock.bottomMoves && clock.bottomMoves() !== null ?
        <div className="clockStageInfo">
          <span>Moves remaining: {clock.bottomMoves()}</span>
        </div> : null
        }
      </div>
    </div>
  )
}

function onClockTouch(ctrl, side) {
  if (((ctrl.clockObj().activeSide() !== 'top') && (side === 'bottom')) || ((ctrl.clockObj().activeSide() !== 'bottom') && (side === 'top'))) {
    ctrl.clockTap(side)
  }
}
