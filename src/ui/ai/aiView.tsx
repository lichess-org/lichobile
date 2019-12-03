import h from 'mithril/hyperscript'
import { getBoardBounds } from '../helper'
import Board from '../shared/Board'
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplay,
  renderInlineReplay
} from '../shared/offlineRound/view'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import { hasSpaceForInlineReplay } from '../shared/round/util'
import * as helper from '../helper'
import actions from './actions'
import newGameMenu from './newAiGame'
import AiRound from './AiRound'

export function renderContent(ctrl: AiRound) {

  const material = ctrl.chessground.getMaterialDiff()
  const isPortrait = helper.isPortrait()
  const vd = helper.viewportDim()
  const bounds = getBoardBounds(helper.viewportDim(), isPortrait)

  const aiName = (
    <h2>
      {ctrl.getOpponent().name}
      { ctrl.vm.engineSearching ?
        <span className="engineSpinner fa fa-hourglass-half" /> :
        null
      }
    </h2>
  )

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
  })

  if (isPortrait) {
    return [
      hasSpaceForInlineReplay(vd, bounds) ? renderInlineReplay(ctrl) : null,
      renderAntagonist(ctrl, aiName, material[ctrl.data.opponent.color], 'opponent'),
      board,
      renderAntagonist(ctrl, ctrl.playerName(), material[ctrl.data.player.color], 'player'),
      renderGameActionsBar(ctrl)
    ]
  } else {
    return [
      board,
      <section className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, aiName, material[ctrl.data.opponent.color], 'opponent')}
          {renderReplay(ctrl)}
          {renderAntagonist(ctrl, ctrl.playerName(), material[ctrl.data.player.color], 'player')}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ]
  }
}

export function overlay(ctrl: AiRound) {
  return [
    actions.view(ctrl.actions),
    newGameMenu.view(ctrl.newGameMenu),
    renderPromotion(ctrl)
  ]
}

