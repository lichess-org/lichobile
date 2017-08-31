import * as h from 'mithril/hyperscript'
import socket from '../../../socket'
import i18n from '../../../i18n'
import { header as headerWidget, backButton } from '../../shared/common'
import layout from '../../layout'
import { tournamentBody, renderPlayerInfoOverlay, renderFAQOverlay, renderFooter } from './tournamentView'

import passwordForm from './passwordForm'
import TournamentCtrl from './TournamentCtrl'

interface Attrs {
  id: string
}

interface State {
  ctrl: TournamentCtrl
}

export default {
  oninit({ attrs }) {
    this.ctrl = new TournamentCtrl(attrs.id)
  },
  onremove() {
    socket.destroy()
    this.ctrl.onUnload()
  },
  view() {
    if (this.ctrl.notFound) {
      return layout.free(
        () => headerWidget(null, backButton(i18n('tournamentNotFound'))),
        () => h('div.tournamentNotFound', { key: 'tournament-not-found' }, [
          h('p', i18n('tournamentDoesNotExist')),
          h('p', i18n('tournamentMayHaveBeenCanceled'))
        ])
      )
    }

    const header = () => headerWidget(null,
      backButton(this.ctrl.tournament ? this.ctrl.tournament.fullName : null)
    )
    const body = () => tournamentBody(this.ctrl)
    const footer = () => renderFooter(this.ctrl)
    const faqOverlay = () => renderFAQOverlay(this.ctrl)
    const playerInfoOverlay = () => renderPlayerInfoOverlay(this.ctrl)
    const overlay = () => [
      faqOverlay(),
      playerInfoOverlay(),
      passwordForm.view()
    ]

    return layout.free(header, body, footer, overlay)
  }
} as Mithril.Component<Attrs, State>
