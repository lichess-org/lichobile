import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import layout from '../layout'
import i18n from '../../i18n'
import session from '../../session'
import { LichessPropOption, ChallengeChoices, Challenge } from '../../lichess/prefs'
import { SettingsProp } from '../../settings'
import * as h from 'mithril/hyperscript'

interface State {
  follow: SettingsProp<boolean>
  challenge: SettingsProp<number>
}

const PrivacyPrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit: function(vnode) {
    const follow = session.lichessBackedProp<boolean>('prefs.follow', session.savePreferences, true)
    const challenge = session.lichessBackedProp<number>('prefs.challenge', session.savePreferences, Challenge.ALWAYS)

    vnode.state = {
      follow,
      challenge
    }
  },

  view: function(vnode) {
    const ctrl = vnode.state
    const header = () => dropShadowHeader(null, backButton(i18n('privacy')))
    return layout.free(header, renderBody.bind(undefined, ctrl))
  }
}

export default PrivacyPrefScreen

function renderBody(ctrl: State) {
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

