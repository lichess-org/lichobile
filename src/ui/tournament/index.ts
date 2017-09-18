import * as helper from '../helper'
import socket from '../../socket'
import session from '../../session'
import { header } from '../shared/common'
import layout from '../layout'
import i18n from '../../i18n'
import newTournamentForm from './newTournamentForm'
import TournamentsListCtrl from './TournamentsListCtrl'

import { renderTournamentsList, renderFooter } from './tournamentsListView'

interface Attrs {
  tab: number
}

interface State {
  ctrl: TournamentsListCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = new TournamentsListCtrl(attrs.tab)
  },

  view() {
    const ctrl = this.ctrl
    const body = () => renderTournamentsList(ctrl)
    const footer = session.isConnected() ? () => renderFooter() : undefined
    const overlay = () => newTournamentForm.view(ctrl)

    return layout.free(() => header(i18n('tournaments')), body, footer, overlay)
  }

} as Mithril.Component<Attrs, State>
