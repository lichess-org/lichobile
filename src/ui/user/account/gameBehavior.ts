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
      h('ul.native_scroller.page.settings_list.game', renderLichessPrefs(prefsCtrl))
    )
  }
} as Mithril.Component<{}, {}>

export const prefsCtrl = {
  premove: session.lichessBackedProp<boolean>('prefs.premove', session.savePreferences, true),
  takeback: session.lichessBackedProp<number>('prefs.takeback', session.savePreferences, Takeback.ALWAYS),
  autoQueen: session.lichessBackedProp<number>('prefs.autoQueen', session.savePreferences, AutoQueen.PREMOVE),
  autoThreefold: session.lichessBackedProp<number>('prefs.autoThreefold', session.savePreferences, AutoThreefold.TIME),
  submitMove: session.lichessBackedProp<number>('prefs.submitMove', session.savePreferences, SubmitMove.CORRESPONDENCE_ONLY),
}

export function renderLichessPrefs(ctrl: typeof prefsCtrl) {
  return [
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('premovesPlayingDuringOpponentTurn'), [
        { label: i18n('no'), value: false },
        { label: i18n('yes'), value: true },
      ], ctrl.premove)),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('takebacksWithOpponentApproval'), TakebackChoices.map(formWidgets.lichessPropToOption), ctrl.takeback
    )),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('promoteToQueenAutomatically'), AutoQueenChoices.map(formWidgets.lichessPropToOption), ctrl.autoQueen
    )),
    h('li.list_item', formWidgets.renderMultipleChoiceButton(
      i18n('claimDrawOnThreefoldRepetitionAutomatically').replace(/\%s/g, ''), AutoThreefoldChoices.map(formWidgets.lichessPropToOption), ctrl.autoThreefold
    )),
    h('li.list_item', [
      h('div.label', i18n('moveConfirmation')),
      h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderLichessPropSelect('', 'moveConfirmation', SubmitMoveChoices, ctrl.submitMove))
    ]),
  ]
}
