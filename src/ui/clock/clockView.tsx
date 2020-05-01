import h from 'mithril/hyperscript'
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

  const whiteClockTimeShortClass = [
    'clockTime',
    clock.whiteTime() < 60000 && !whiteFlagged ? 'short' : 'noshort'
  ].join(' ')

  const blackClockTimeClass = [
    'clockTime',
    blackFlagged ? 'flagged' : '',
    clock.blackTime() >= 3600 ? 'long' : ''
  ].join(' ')

  const blackClockTimeShortClass = [
    'clockTime',
    clock.blackTime() < 60000 && !blackFlagged ? 'short' : 'noshort'
  ].join(' ')

  return (
    <div className="clockContainer">
      <div className={whiteClockClass} oncreate={helper.ontouch(() => onClockTouch(ctrl, 'white'))}>
        { isStageClock(clock) ? renderMoves(clock.whiteMoves()) : null }
        <div className="clockTapAreaContent">
          <span className={whiteClockTimeClass}>
            { whiteFlagged ? 'b' : formatTime(ctrl.clockType(), clock.whiteTime() / 1000) }
          </span>
          <span className={whiteClockTimeShortClass}>
            { '.' + Math.trunc(clock.whiteTime() / 100 % 10) }
          </span>
        </div>
      </div>
      <div className="clockControls">
        <button className={'fa' + (clock.isRunning() ? ' fa-pause' : ' fa-play')} oncreate={helper.ontap(() => ctrl.startStop())} disabled={flagged || !clock.activeSide()} />
        <button className={'fa fa-refresh' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.reload)} />
        <button className={'fa fa-cog' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.clockSettingsCtrl.open)} />
        <button hey="home" className={'fa fa-home' + ((clock.isRunning() && !flagged) ? ' disabled' : '')} oncreate={helper.ontap(ctrl.goHome)} />
      </div>
      <div className={blackClockClass} oncreate={helper.ontouch(() => onClockTouch(ctrl, 'black'))}>
        <div className="clockTapAreaContent">
          <span className={blackClockTimeClass}>
            { blackFlagged ? 'b' : formatTime(ctrl.clockType(), clock.blackTime() / 1000) }
          </span>
          <span className={blackClockTimeShortClass}>
            { '.' + Math.trunc(clock.blackTime() / 100 % 10) }
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
