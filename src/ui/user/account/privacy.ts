import h from 'mithril/hyperscript'
import i18n from '../../../i18n'
import session from '../../../session'
import { Prop } from '../../../settings'
import { ChallengeChoices, Challenge } from '../../../lichess/prefs'
import { dropShadowHeader, backButton } from '../../shared/common'
import formWidgets from '../../shared/form'
import layout from '../../layout'
import * as helper from '../../helper'

interface Ctrl {
  follow: Prop<boolean>
  challenge: Prop<number>
}

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.ctrl = {
      follow: session.lichessBackedProp<boolean>('prefs.follow', true),
      challenge: session.lichessBackedProp<number>('prefs.challenge', Challenge.ALWAYS)
    }
  },

  view() {
    const ctrl = this.ctrl
    const header = dropShadowHeader(null, backButton(i18n('privacy')))
    return layout.free(header, renderBody(ctrl))
  }
} as Mithril.Component<Record<string, never>, { ctrl: Ctrl }>

function renderBody(ctrl: Ctrl) {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderMultipleChoiceButton(i18n('letOtherPlayersFollowYou'), formWidgets.booleanChoice, ctrl.follow)),
      h('li.list_item', formWidgets.renderMultipleChoiceButton(i18n('letOtherPlayersChallengeYou'), ChallengeChoices, ctrl.challenge))
    ])
  ]
}

