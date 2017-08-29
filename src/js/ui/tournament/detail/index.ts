import socket from '../../../socket'
import oninit from './tournamentDetailCtrl'
import view from './tournamentDetailView'

import { TournamentAttrs, TournamentState } from '../interfaces'

export default {
  oninit,
  onremove() {
    socket.destroy()
    clearInterval(this.clockInterval())
  },
  view
} as Mithril.Component<TournamentAttrs, TournamentState>
