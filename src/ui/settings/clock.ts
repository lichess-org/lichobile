import h from 'mithril/hyperscript'
import i18n from '../../i18n'
import settings from '../../settings'
import session from '../../session'
import { hasNetwork } from '../../utils'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import layout from '../layout'
import { prefsCtrl, render as renderLichessPrefs } from '../user/account/clock'

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('clock')))
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
        'Clock position', [
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
        settings.game.clockPosition
      )
    ),
  ]
}
