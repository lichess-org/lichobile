import socket from '../../../socket'
import oninit from './tournamentDetailCtrl'
import view from './tournamentDetailView'

import { TournamentAttrs, TournamentState } from '../interfaces'

const TournamentDetailScreen: Mithril.Component<TournamentAttrs, TournamentState> = {
  oninit,
  onremove() {
    socket.destroy()
    clearInterval(this.clockInterval())
  },
  view
}

export default TournamentDetailScreen
