import h from 'mithril/hyperscript'
import layout from '../layout'
import i18n from '../../i18n'
import { hasNetwork } from '../../utils'
import settings from '../../settings'
import session from '../../session'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import { prefsCtrl, render as renderLichessPrefs } from '../user/account/gameBehavior'

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('gameBehavior')))
    return layout.free(header,
      h('ul.native_scroller.page.settings_list.multiChoices',
        renderAppPrefs().concat(hasNetwork() && session.isConnected() ?
          renderLichessPrefs(prefsCtrl) : []
        )
    ))
  }
} as Mithril.Component

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
    h('li.list_item',
      formWidgets.renderMultipleChoiceButton(
        i18n('castleByMovingTheKingTwoSquaresOrOntoTheRook'), [
          { label: i18n('castleByMovingTwoSquares'), value: 0 },
          { label: i18n('castleByMovingOntoTheRook'), value: 1 },
        ],
        settings.game.rookCastle,
      )
    ),
  ]
}
