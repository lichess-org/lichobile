import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import layout from '../layout'
import i18n from '../../i18n'
import session from '../../session'
import { LichessPropOption, ChallengeChoices, Challenge } from '../../lichess/prefs'
import { SettingsProp } from '../../settings'
import * as h from 'mithril/hyperscript'

interface Ctrl {
  follow: SettingsProp<boolean>
  challenge: SettingsProp<number>
}

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.ctrl = {
      follow: session.lichessBackedProp<boolean>('prefs.follow', session.savePreferences, true),
      challenge: session.lichessBackedProp<number>('prefs.challenge', session.savePreferences, Challenge.ALWAYS)
    }
  },

  view() {
    const ctrl = this.ctrl
    const header = () => dropShadowHeader(null, backButton(i18n('privacy')))
    return layout.free(header, renderBody.bind(undefined, ctrl))
  }
} as Mithril.Component<{}, { ctrl: Ctrl }>

function renderBody(ctrl: Ctrl) {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderCheckbox(i18n('letOtherPlayersFollowYou'),
        'follow', ctrl.follow)),
      h('li.list_item', [
        h('div.label', i18n('letOtherPlayersChallengeYou')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderLichessPropSelect('', 'challenge', <Array<LichessPropOption>>ChallengeChoices, ctrl.challenge))
      ])
    ])
  ]
}

