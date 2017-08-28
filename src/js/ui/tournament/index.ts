import * as helper from '../helper'
import socket from '../../socket'
import session from '../../session'
import { header } from '../shared/common'
import layout from '../layout'
import i18n from '../../i18n'
import newTournamentForm from './newTournamentForm'
import TournamentCtrl from './TournamentCtrl'

import { tournamentListBody, renderFooter } from './tournamentView'

interface Attrs {
  tab: string
}

interface State {
  ctrl: TournamentCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = new TournamentCtrl(attrs.tab)
  },

  view() {
    const ctrl = this.ctrl
    const bodyCtrl = () => tournamentListBody(ctrl)
    const footer = session.isConnected() ? () => renderFooter() : undefined
    const overlay = () => newTournamentForm.view(ctrl)

    return layout.free(() => header(i18n('tournaments')), bodyCtrl, footer, overlay)
  }

} as Mithril.Component<Attrs, State>
