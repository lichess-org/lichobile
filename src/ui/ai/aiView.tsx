import * as h from 'mithril/hyperscript'
import { getBoardBounds } from '../helper'
import Board from '../shared/Board'
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplayTable
} from '../shared/offlineRound/view'
import { view as renderPromotion } from '../shared/offlineRound/promotion'
import * as helper from '../helper'
import actions from './actions'
import newGameMenu from './newAiGame'
import AiRound from './AiRound'

export function renderContent(ctrl: AiRound) {

  const material = ctrl.chessground.getMaterialDiff()
  const isPortrait = helper.isPortrait()
  const bounds = getBoardBounds(helper.viewportDim(), isPortrait, 'game')
  const replayTable = renderReplayTable(ctrl.replay)

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
    bounds
  })

  const orientationKey = isPortrait ? 'o-portrait' : 'o-landscape'

  if (isPortrait) {
    return h.fragment({ key: orientationKey }, [
      renderAntagonist(ctrl, aiName, material[ctrl.data.opponent.color], 'opponent', isPortrait),
      board,
      renderAntagonist(ctrl, ctrl.playerName(), material[ctrl.data.player.color], 'player', isPortrait),
      renderGameActionsBar(ctrl)
    ])
  } else {
    return h.fragment({ key: orientationKey }, [
      board,
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, aiName, material[ctrl.data.opponent.color], 'opponent', isPortrait)}
          {replayTable}
          {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait)}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ])
  }
}

export function overlay(ctrl: AiRound) {
  return [
    actions.view(ctrl.actions),
    newGameMenu.view(ctrl.newGameMenu),
    renderPromotion(ctrl)
  ]
}

