import h from 'mithril/hyperscript'
import layout from '../../layout'
import i18n from '../../../i18n'
import session from '../../../session'
import { Takeback, SubmitMove, AutoQueen, AutoThreefold, SubmitMoveChoices, TakebackChoices, AutoQueenChoices, AutoThreefoldChoices } from '../../../lichess/prefs'
import * as helper from '../../helper'
import { dropShadowHeader, backButton } from '../../shared/common'
import formWidgets from '../../shared/form'

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('gameBehavior')))
    return layout.free(header,
      h('ul.native_scroller.page.settings_list.game', render(prefsCtrl))
    )
  }
} as Mithril.Component

export const prefsCtrl = {
  premove: session.lichessBackedProp<boolean>('prefs.premove', true),
  takeback: session.lichessBackedProp<number>('prefs.takeback', Takeback.ALWAYS),
  autoQueen: session.lichessBackedProp<number>('prefs.autoQueen', AutoQueen.PREMOVE),
  autoThreefold: session.lichessBackedProp<number>('prefs.autoThreefold', AutoThreefold.TIME),
  submitMove: session.lichessBackedProp<number>('prefs.submitMove', SubmitMove.CORRESPONDENCE_ONLY),
}

export function render(ctrl: typeof prefsCtrl) {
  return [
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('premovesPlayingDuringOpponentTurn'), formWidgets.booleanChoice, ctrl.premove)),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('takebacksWithOpponentApproval'), TakebackChoices, ctrl.takeback
    )),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('promoteToQueenAutomatically'), AutoQueenChoices, ctrl.autoQueen
    )),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('claimDrawOnThreefoldRepetitionAutomatically').replace(/%s/g, ''), AutoThreefoldChoices, ctrl.autoThreefold
    )),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('moveConfirmation'), SubmitMoveChoices, ctrl.submitMove
    )),
  ]
}
