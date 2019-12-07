import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import layout from '../layout'
import i18n from '../../i18n'
import { hasNetwork } from '../../utils'
import settings, { Prop } from '../../settings'
import session from '../../session'
import { Takeback, SubmitMove, AutoQueen, AutoThreefold, SubmitMoveChoices, TakebackChoices, AutoQueenChoices, AutoThreefoldChoices } from '../../lichess/prefs'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'

interface Ctrl {
  readonly premove: Prop<boolean>
  readonly takeback: Prop<number>
  readonly autoQueen: Prop<number>
  readonly autoThreefold: Prop<number>
  readonly submitMove: Prop<number>
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
    const header = dropShadowHeader(null, backButton(i18n('gameBehavior')))
    return layout.free(header,
      h('ul.native_scroller.page.settings_list.game',
        renderAppPrefs().concat(hasNetwork() && session.isConnected() ?
          renderLichessPrefs(ctrl) : []
        )
    ))
  }
} as Mithril.Component<{}, State>

function renderAppPrefs() {
  return [
    h('li.list_item',
      formWidgets.renderMultipleChoiceButton(
        i18n('howDoYouMovePieces'), [
          { label: i18n('clickTwoSquares'), value: 'tap' },
          { label: i18n('dragPiece'), value: 'drag' },
          { label: i18n('bothClicksAndDrag'), value: 'both' },
        ],
        settings.game.pieceMove
      )
    ),
  ]
}

function renderLichessPrefs(ctrl: Ctrl) {
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
    ])
  ]
}

