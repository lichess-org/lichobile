import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import layout from '../layout'
import i18n from '../../i18n'
import * as helper from '../helper'
import session from '../../session'
import { StoredProp } from '../../storage'
import { LichessPropOption, Takeback, SubmitMove, AutoQueen, AutoThreefold, SubmitMoveChoices, TakebackChoices, AutoQueenChoices, AutoThreefoldChoices } from '../../lichess/prefs'
import * as h from 'mithril/hyperscript'

interface Ctrl {
  readonly premove: StoredProp<boolean>
  readonly takeback: StoredProp<number>
  readonly autoQueen: StoredProp<number>
  readonly autoThreefold: StoredProp<number>
  readonly submitMove: StoredProp<number>
}

interface State {
  ctrl: Ctrl
}

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.ctrl = {
      premove: session.lichessBackedProp<boolean>('prefs.premove', session.savePreferences, true),
      takeback: session.lichessBackedProp<number>('prefs.takeback', session.savePreferences, Takeback.ALWAYS),
      autoQueen: session.lichessBackedProp<number>('prefs.autoQueen', session.savePreferences, AutoQueen.PREMOVE),
      autoThreefold: session.lichessBackedProp<number>('prefs.autoThreefold', session.savePreferences, AutoThreefold.TIME),
      submitMove: session.lichessBackedProp<number>('prefs.submitMove', session.savePreferences, SubmitMove.CORRESPONDENCE_ONLY)
    }
  },

  view() {
    const ctrl = this.ctrl
    const header = () => dropShadowHeader(null, backButton(i18n('gameBehavior')))
    return layout.free(header, () => renderBody(ctrl))
  }
} as Mithril.Component<{}, State>

function renderBody(ctrl: Ctrl) {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderCheckbox(i18n('premovesPlayingDuringOpponentTurn'),
        'premove', ctrl.premove)),
      h('li.list_item', [
        h('div.label', i18n('takebacksWithOpponentApproval')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderLichessPropSelect('', 'takeback', <Array<LichessPropOption>>TakebackChoices, ctrl.takeback))
      ]),
      h('li.list_item', [
        h('div.label', i18n('promoteToQueenAutomatically')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderLichessPropSelect('', 'autoQueen', <Array<LichessPropOption>>AutoQueenChoices, ctrl.autoQueen))
      ]),
      h('li.list_item', [
        h('div.label', i18n('claimDrawOnThreefoldRepetitionAutomatically').replace(/\%s/g, '')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderLichessPropSelect('', 'autoThreefold', <Array<LichessPropOption>>AutoThreefoldChoices, ctrl.autoThreefold))
      ]),
      h('li.list_item', [
        h('div.label', i18n('moveConfirmation')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderLichessPropSelect('', 'moveConfirmation', <Array<LichessPropOption>>SubmitMoveChoices, ctrl.submitMove))
      ])
    ])
  ]
}

