import * as h from 'mithril/hyperscript'
import * as utils from '../../utils'
import i18n from '../../i18n'
import Board from '../shared/Board'
import { renderAntagonist, renderReplayTable, renderBackwardButton, renderForwardButton } from '../shared/offlineRound/view'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
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
  const replayTable = renderReplayTable(ctrl.replay)
  const isPortrait = helper.isPortrait()
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'game')

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
    bounds,
    wrapperClasses,
    customPieceTheme: pieceTheme
  })

  const orientationKey = isPortrait ? 'o-portrait' : 'o-landscape'

  const clock = ctrl.clock

  if (isPortrait)
    return h.fragment({ key: orientationKey }, [
      renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait, flip, pieceTheme, clock),
      board,
      renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait, flip, pieceTheme, clock),
      renderGameActionsBar(ctrl)
    ])
  else
    return h.fragment({ key: orientationKey }, [
      board,
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait, flip, pieceTheme, clock)}
          {replayTable}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait, flip, pieceTheme, clock)}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ])
}

function renderGameActionsBar(ctrl: OtbRound) {
  return (
    <section key="actionsBar" className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h"
        oncreate={helper.ontap(ctrl.actions.open)}
      />
      <button className="action_bar_button" data-icon="U"
        oncreate={helper.ontap(
          ctrl.newGameMenu.open,
          () => window.plugins.toast.show(i18n('createAGame'), 'short', 'bottom')
        )}
      />
      <button data-icon="A" className="action_bar_button"
        oncreate={helper.ontap(
          ctrl.goToAnalysis,
          () => window.plugins.toast.show(i18n('analysis'), 'short', 'bottom')
        )}
      />
      <button className="fa fa-share-alt action_bar_button"
        oncreate={helper.ontap(
          ctrl.sharePGN,
          () => window.plugins.toast.show(i18n('sharePGN'), 'short', 'bottom')
        )}
      />
      {ctrl.clock ?
        ((!ctrl.clock.flagged() && ctrl.clock.activeSide()) ?
          <button id="playPause" className={'fa action_bar_button ' + (ctrl.clock.isRunning() ? 'fa-pause' : 'fa-play')}
            oncreate={helper.ontap(
              () => ctrl.clock.startStop(),
              () => window.plugins.toast.show(i18n('chessClock'), 'short', 'bottom')
            )}
          />
          :
          <button key="disabled-pause" className="fa action_bar_button fa-pause disabled"/>
        )
        : null
      }
      {utils.hasNetwork() ?
        <button className="fa fa-cloud-upload action_bar_button"
          oncreate={helper.ontap(
            ctrl.importGamePopup.open,
            () => window.plugins.toast.show(i18n('Import game to lichess'), 'short', 'bottom')
          )}
        /> : null
      }
      {renderBackwardButton(ctrl)}
      {renderForwardButton(ctrl)}
    </section>
  )
}
