import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import * as utils from '../../utils'
import i18n from '../../i18n'
import Board from '../shared/Board'
import {
  renderAntagonist,
  renderReplay,
  renderInlineReplay,
  renderBackwardButton,
  renderForwardButton,
} from '../shared/offlineRound/view'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import { hasSpaceForInlineReplay } from '../shared/round/util'
import * as helper from '../helper'
import actions from './actions'
import newGameMenu from './newOtbGame'
import importGamePopup from './importGamePopup'
import settings from '../../settings'
import OtbRound from './OtbRound'

export function overlay(ctrl: OtbRound) {
  return [
    actions.view(ctrl.actions),
    newGameMenu.view(ctrl.newGameMenu),
    importGamePopup.view(ctrl.importGamePopup),
    renderPromotion(ctrl)
  ]
}

export function renderContent(ctrl: OtbRound, pieceTheme?: string) {
  const flip = settings.otb.flipPieces()
  const wrapperClasses = helper.classSet({
    'otb': true,
    'mode_flip': flip,
    'mode_facing': !flip,
    'turn_white': ctrl.chessground.state.turnColor === 'white',
    'turn_black': ctrl.chessground.state.turnColor === 'black'
  })
  const material = ctrl.chessground.getMaterialDiff()
  const playerName = i18n(ctrl.data.player.color)
  const opponentName = i18n(ctrl.data.opponent.color)
  const replayTable = renderReplay(ctrl)
  const isPortrait = helper.isPortrait()
  const vd = helper.viewportDim()
  const bounds = helper.getBoardBounds(vd, isPortrait)

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
    bounds,
    wrapperClasses,
    customPieceTheme: pieceTheme
  })

  const clock = ctrl.clock

  if (isPortrait)
    return [
      hasSpaceForInlineReplay(vd, bounds) ? renderInlineReplay(ctrl) : null,
      renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', flip, pieceTheme, clock),
      board,
      renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', flip, pieceTheme, clock),
      renderGameActionsBar(ctrl)
    ]
  else
    return [
      board,
      <section className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', flip, pieceTheme, clock)}
          {replayTable}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', flip, pieceTheme, clock)}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ]
}

function renderGameActionsBar(ctrl: OtbRound) {
  return (
    <section className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-v"
        oncreate={helper.ontap(ctrl.actions.open)}
      />
      <button className="action_bar_button fa fa-plus-circle"
        oncreate={helper.ontap(
          ctrl.newGameMenu.open,
          () => Plugins.Toast.show({ text: i18n('createAGame'), duration: 'short' })
        )}
      />
      <button className="fa fa-share-alt action_bar_button"
        oncreate={helper.ontap(
          ctrl.sharePGN,
          () => Plugins.Toast.show({ text: i18n('sharePGN'), duration: 'short' })
        )}
      />
      {ctrl.clock ?
        <button className={'fa action_bar_button ' + (ctrl.clock.isRunning() ? 'fa-pause' : 'fa-play') + (ctrl.isClockEnabled() ? '' : ' disabled')}
          oncreate={helper.ontap(
            ctrl.toggleClockPlay,
            () => Plugins.Toast.show({ text: i18n('chessClock'), duration: 'short' })
          )}
        />
        : null
      }
      {utils.hasNetwork() ?
        <button className="fa fa-cloud-upload action_bar_button"
          oncreate={helper.ontap(
            ctrl.importGamePopup.open,
            () => Plugins.Toast.show({ text: i18n('Import game to lichess'), duration: 'short' })
          )}
        /> : null
      }
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  )
}
