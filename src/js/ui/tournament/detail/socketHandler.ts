import redraw from '../../../utils/redraw'
import router from '../../../router'
import { MessageHandlers } from '../../../socket'

import TournamentCtrl from './TournamentCtrl'

interface FeaturedGameUpdate {
  id: string
  fen: string
  lm: string
}

export default function(ctrl: TournamentCtrl) {
  return {
    reload: ctrl.reload,
    resync: ctrl.reload,
    redirect(gameId: string) {
      router.set('/tournament/' + ctrl.tournament.id + '/game/' + gameId, true)
    },
    fen(d: FeaturedGameUpdate) {
      const featured = ctrl.tournament.featured
      if (!featured) return
      if (featured.id !== d.id) return
      featured.fen = d.fen
      featured.lastMove = d.lm
      redraw()
    }
  } as MessageHandlers
}
