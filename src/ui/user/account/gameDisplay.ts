import h from 'mithril/hyperscript'
import layout from '../../layout'
import i18n from '../../../i18n'
import session from '../../../session'
import { AnimationChoices, Animation } from '../../../lichess/prefs'
import * as helper from '../../helper'
import { dropShadowHeader, backButton } from '../../shared/common'
import formWidgets from '../../shared/form'

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('gameDisplay')))
    return layout.free(header,
      h('ul.native_scroller.page.settings_list.game', render(prefsCtrl))
    )
  }
} as Mithril.Component

const prefsCtrl = {
  animation: session.lichessBackedProp<number>('prefs.animation', Animation.NORMAL),
  showCaptured: session.lichessBackedProp<boolean>('prefs.captured', true),
}

export function render(ctrl: typeof prefsCtrl) {
  return [
    h('li.list_item',
      formWidgets.renderMultipleChoiceButton(i18n('pieceAnimation'), AnimationChoices, ctrl.animation),
    ),
    h('li.list_item',
      formWidgets.renderMultipleChoiceButton(i18n('materialDifference'), formWidgets.booleanChoice, ctrl.showCaptured),
    ),
  ]
}

