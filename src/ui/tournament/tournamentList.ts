import socket from '../../socket'
import i18n from '../../i18n'
import session from '../../session'
import { safeStringToNum } from '../../utils'
import * as helper from '../helper'
import { header } from '../shared/common'
import layout from '../layout'

import newTournamentForm from './newTournamentForm'
import TournamentsListCtrl from './TournamentsListCtrl'
import { renderTournamentsList, renderFooter } from './tournamentsListView'

interface Attrs {
  tab?: string
}

interface State {
  ctrl: TournamentsListCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = new TournamentsListCtrl(safeStringToNum(attrs.tab))
  },

  view() {
    const ctrl = this.ctrl
    const body = renderTournamentsList(ctrl)
    const footer = session.isConnected() ? renderFooter() : undefined
    const overlay = newTournamentForm.view(ctrl)

    return layout.free(header(i18n('tournaments')), body, footer, overlay)
  }

} as Mithril.Component<Attrs, State>
