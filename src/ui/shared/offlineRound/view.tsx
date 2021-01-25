import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import * as utils from '../../../utils'
import i18n from '../../../i18n'
import * as gameApi from '../../../lichess/game'
import gameStatusApi from '../../../lichess/status'
import { fixCrazySan } from '../../../utils/chessFormat'
import { renderMaterial } from '../../shared/round/view/roundView'
import * as helper from '../../helper'
import CrazyPocket from '../../shared/round/crazy/CrazyPocket'
import { OfflineRoundInterface, Position, Material } from '../round'
import settings from '../../../settings'
import Replay from './Replay'
import { IChessClock, IStageClock } from '../clock/interfaces'
import { autoScroll, autoScrollInline, onReplayTap, getMoveEl } from '../round/util'

let pieceNotation: boolean

function getChecksCount(ctrl: OfflineRoundInterface, color: Color) {
  const sit = ctrl.replay.situation()
  if (sit.checkCount)
    return utils.oppositeColor(color) === 'white' ?
      sit.checkCount.white : sit.checkCount.black
  else
    return 0
}

export function renderAntagonist(
  ctrl: OfflineRoundInterface,
  content: Mithril.Children,
  material: Material,
  position: Position,
  otbFlip?: boolean,
  customPieceTheme?: string,
  clock?: IChessClock,
) {
  const sit = ctrl.replay.situation()
  const isCrazy = !!sit.crazyhouse
  const antagonist = position === 'player' ? ctrl.data.player : ctrl.data.opponent
  const antagonistColor = antagonist.color

  const className = [
    'playTable',
    'offline',
    position,
    isCrazy ? 'crazy' : '',
    otbFlip !== undefined ? otbFlip ? 'mode_flip' : 'mode_facing' : '',
    ctrl.chessground.state.turnColor === ctrl.data.player.color ? 'player_turn' : 'opponent_turn',
  ].join(' ')

  return (
    <section id={position + '_info'} className={className}>
      <div className={'antagonistInfos offline' + (isCrazy ? ' crazy' : '')}>
        <div className="antagonistUser">
          {content}
          {isCrazy && clock ? renderClock(clock, antagonistColor) : ''}
        </div>
        { !isCrazy ? <div className="ratingAndMaterial">
          {ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
          { ctrl.data.game.variant.key === 'threeCheck' ?
            <div className="checkCount">&nbsp;+{getChecksCount(ctrl, antagonistColor)}</div> : null
          }
        </div> : null
        }
      </div>
      {sit.crazyhouse ?
        h(CrazyPocket, {
          ctrl,
          crazyData: sit.crazyhouse,
          color: antagonistColor,
          position,
          customPieceTheme
        })
        :
        clock ? renderClock(clock, antagonistColor) : null}
    </section>
  )
}


export function renderGameActionsBar(ctrl: OfflineRoundInterface) {
  return (
    <section className="actions_bar">
      <button className="action_bar_button fa fa-list"
        oncreate={helper.ontap(ctrl.actions.open)}
      />
      <button className="action_bar_button fa fa-plus-circle"
        oncreate={helper.ontap(
          ctrl.newGameMenu.open,
          () => Plugins.LiToast.show({ text: i18n('createAGame'), duration: 'short', position: 'bottom' })
        )}
      />
      <button className="fa fa-share-alt action_bar_button"
        oncreate={helper.ontap(
          ctrl.sharePGN,
          () => Plugins.LiToast.show({ text: i18n('sharePGN'), duration: 'short', position: 'bottom' })
        )}
      />
      <button className="action_bar_button" data-icon="A"
        oncreate={helper.ontap(ctrl.goToAnalysis)}
      />
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  )
}

export function renderEndedGameStatus(ctrl: OfflineRoundInterface) {
  if (!ctrl.replay) return null

  const sit = ctrl.replay.situation()
  if (gameStatusApi.finished(ctrl.data)) {
    const result = gameApi.result(ctrl.data)
    const winner = sit.winner
    const status = gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.turns, ctrl.data.game.winner, ctrl.data.game.variant.key) +
      (winner ? '. ' + i18n(winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '')
    return (
      <div className="result">
        {result}
        <br />
        <em className="resultStatus">{status}</em>
      </div>
    )
  }

  return null
}

export function renderClaimDrawButton(ctrl: OfflineRoundInterface) {
  return gameApi.playable(ctrl.data) ? h('button.draw-yes', {
    oncreate: helper.ontap(() => ctrl.replay.claimDraw())
  }, h('span', '½'), i18n('threefoldRepetition')) : null
}

export function renderReplay(ctrl: OfflineRoundInterface) {
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation
  return h('div.replay.box', {
    className: pieceNotation ? ' displayPieces' : '',
    oncreate: (vnode: Mithril.VnodeDOM<any, any>) => {
      setTimeout(() => autoScroll(vnode.dom as HTMLElement), 100)
      helper.ontapY((e: Event) => onReplayTap(ctrl, e), undefined, getMoveEl)(vnode)
    },
    onupdate: (vnode: Mithril.VnodeDOM<any, any>) => autoScroll(vnode.dom as HTMLElement),
  }, renderMoves(ctrl.replay))
}


export function renderInlineReplay(ctrl: OfflineRoundInterface) {
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation

  if (!ctrl.moveList) {
    return null
  }

  return h('div.replay_inline', {
    className: pieceNotation ? ' displayPieces' : '',
    oncreate: (vnode: Mithril.VnodeDOM<any, any>) => {
      setTimeout(() => autoScrollInline(vnode.dom as HTMLElement), 100)
      helper.ontapX((e: Event) => onReplayTap(ctrl, e), undefined, getMoveEl)(vnode)
    },
    onupdate: (vnode: Mithril.VnodeDOM<any, any>) => autoScrollInline(vnode.dom as HTMLElement),
  }, renderMoves(ctrl.replay))
}


export function renderBackwardButton(ctrl: OfflineRoundInterface) {
  return h('button.action_bar_button.fa.fa-chevron-left', {
    oncreate: helper.ontap(ctrl.jumpPrev, ctrl.jumpFirst),
    className: helper.classSet({
      disabled: !(ctrl.replay.ply > ctrl.firstPly())
    })
  })
}

export function renderForwardButton(ctrl: OfflineRoundInterface) {
  return h('button.action_bar_button.fa.fa-chevron-right', {
    oncreate: helper.ontap(ctrl.jumpNext, ctrl.jumpLast),
    className: helper.classSet({
      disabled: !(ctrl.replay.ply < ctrl.lastPly())
    })
  })
}

function renderMoves(replay: Replay) {
  return replay.situations.filter(s => s.san !== undefined).map(s => h('move.replayMove', {
    className: s.ply === replay.ply ? 'current' : '',
    'data-ply': s.ply,
  }, [
    s.ply & 1 ? h('index', renderIndex(s.ply, true)) : null,
    fixCrazySan(s.san!)
  ]))
}

function renderIndexText(ply: Ply, withDots?: boolean): string {
  return plyToTurn(ply) + (withDots ? (ply % 2 === 1 ? '.' : '...') : '')
}

function renderIndex(ply: Ply, withDots?: boolean): Mithril.Children {
  return h('index', renderIndexText(ply, withDots))
}

function plyToTurn(ply: number): number {
  return Math.floor((ply - 1) / 2) + 1
}

function pad2(num: number): string {
 return (num < 10 ? '0' : '') + num
}

const sepHigh = ':'
const sepLow = ' '
function formatClockTime(time: Millis, isRunning = false) {
  const date = new Date(time)
  const millis = date.getUTCMilliseconds()
  const minutes = pad2(date.getUTCMinutes())
  const seconds = pad2(date.getUTCSeconds())

  if (time >= 3600000) {
    const hours = pad2(date.getUTCHours())
    const pulse = (isRunning && millis < 500) ? sepLow : sepHigh
    return hours + pulse + minutes
  }
  if (time < 10000) {
    const tenthsStr = Math.floor(millis / 100).toString()
    return [minutes + sepHigh + seconds, h('tenths', '.' + tenthsStr)]
  }

  return minutes + sepHigh + seconds
}

function renderClock(clock: IChessClock, color: Color) {
  const runningColor = clock.activeSide()
  const time = clock.getTime(color)
  const isRunning = runningColor === color
  const moves = clock.clockType === 'stage' ? (clock as IStageClock).getMoves(color) : null
  return h('div', {
    className: helper.classSet({
      clock: true,
      outoftime: !time,
      running: isRunning,
      offlineClock: true,
      stageClock: !!moves,
    })
  }, [
    formatClockTime(time, isRunning),
    moves ? h('div.clockMoves', 'Moves: ' + moves) : null
  ])
}
