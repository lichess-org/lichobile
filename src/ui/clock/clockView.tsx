import * as helper from '../helper'
import clockSettings from './clockSettings'
import { formatTime, isStageClock } from '../shared/clock/utils'

import { IChessClockCtrl } from './ChessClockCtrl'

export function renderClockSettingsOverlay(ctrl: IChessClockCtrl) {
  return [
    clockSettings.view(ctrl.clockSettingsCtrl)
  ]
}

export function clockBody(ctrl: IChessClockCtrl) {
  const clock = ctrl.clockObj()
  if (!clock) return null
  const whiteActive = clock.activeSide() === 'white'
  const blackActive = clock.activeSide() === 'black'
  const whiteFlagged = clock.flagged() === 'white'
  const blackFlagged = clock.flagged() === 'black'
  const flagged = whiteFlagged || blackFlagged

  const whiteClockClass = [
    'clockTapArea',
    'white',
    whiteActive ? 'active' : '',
    clock.isRunning() ? 'running' : '',
    whiteFlagged ? 'flagged' : ''
  ].join(' ')

  const blackClockClass = [
    'clockTapArea',
    'black',
    blackActive ? 'active' : '',
    clock.isRunning() ? 'running' : '',
    blackFlagged ? 'flagged' : ''
  ].join(' ')

  const whiteClockTimeClass = [
    'clockTime',
    whiteFlagged ? 'flagged' : '',
    clock.whiteTime() >= 3600 ? 'long' : ''
  ].join(' ')

  const blackClockTimeClass = [
    'clockTime',
    blackFlagged ? 'flagged' : '',
    clock.blackTime() >= 3600 ? 'long' : ''
  ].join(' ')

  return (
    <div className="clockContainer">
      <div key="whiteClockTapArea" className={whiteClockClass} oncreate={helper.ontouch(() => onClockTouch(ctrl, 'white'))}>
        { isStageClock(clock) ? renderMoves(clock.whiteMoves()) : null }
        <div className="clockTapAreaContent">
          <span className={whiteClockTimeClass}>
            { whiteFlagged ? 'b' : formatTime(ctrl.clockType(), clock.whiteTime() / 1000) }
          </span>
        </div>
      </div>
      <div className="clockControls">
        { !flagged && clock.activeSide() ? <span key="running-play-pause" className={'fa' + (clock.isRunning() ? ' fa-pause' : ' fa-play')} oncreate={helper.ontap(() => ctrl.startStop())} /> : <span key="disabled-pause" className="fa fa-pause disabled" /> }
        <span key="refresh" className={'fa fa-refresh' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.reload)} />
        <span key="settings" className={'fa fa-cog' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.clockSettingsCtrl.open)} />
        <span hey="home" className={'fa fa-home' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.goHome)} />
      </div>
      <div key="blackClockTapArea" className={blackClockClass} oncreate={helper.ontouch(() => onClockTouch(ctrl, 'black'))}>
        <div className="clockTapAreaContent">
          <span className={blackClockTimeClass}>
            { blackFlagged ? 'b' : formatTime(ctrl.clockType(), clock.blackTime() / 1000) }
          </span>
        </div>
        { isStageClock(clock) ? renderMoves(clock.blackMoves()) : null }
      </div>
    </div>
  )
}

function renderMoves(moves: number | null) {
  if (moves !== null) {
    return (
      <div className="clockStageInfo">
        <span>Moves remaining: {moves}</span>
      </div>
    )
  }

  return null
}

function onClockTouch(ctrl: IChessClockCtrl, side: Color) {
  if (((ctrl.clockObj().activeSide() !== 'white') && (side === 'black')) || ((ctrl.clockObj().activeSide() !== 'black') && (side === 'white'))) {
    ctrl.clockTap(side)
  }
}
