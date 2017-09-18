import * as helper from '../helper'
import clockSettings from './clockSettings'
import { formatTimeInSecs } from '../../utils'

import { IChessClockCtrl } from './ChessClockCtrl'
import { ClockType, Side, IChessClock, IStageClock } from './interfaces'

export function renderClockSettingsOverlay(ctrl: IChessClockCtrl) {
  return [
    clockSettings.view(ctrl.clockSettingsCtrl)
  ]
}

export function clockBody(ctrl: IChessClockCtrl) {
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
        { isStageClock(clock) ? renderMoves(clock.topMoves()) : null }
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
        { isStageClock(clock) ? renderMoves(clock.bottomMoves()) : null }
      </div>
    </div>
  )
}

function renderMoves(moves: number | null) {
  console.log(moves)
  if (moves !== null) {
    return (
      <div className="clockStageInfo">
        <span>Moves remaining: {moves}</span>
      </div>
    )
  }

  return null
}

function onClockTouch(ctrl: IChessClockCtrl, side: Side) {
  if (((ctrl.clockObj().activeSide() !== 'top') && (side === 'bottom')) || ((ctrl.clockObj().activeSide() !== 'bottom') && (side === 'top'))) {
    ctrl.clockTap(side)
  }
}

function formatTime(clockType: ClockType, time: number) {
  if (clockType === 'hourglass') {
    return formatTimeInSecs(Math.round(time))
  } else {
    return formatTimeInSecs(Math.floor(time))
  }
}

function isStageClock(c: IChessClock | IStageClock): c is IStageClock {
  return (c as IStageClock).topMoves !== undefined
}
