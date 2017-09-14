import { handleXhrError  } from '../../utils'
import * as chess from '../../chess'
import redraw from '../../utils/redraw'
import session from '../../session'
import { getPGN } from '../shared/round/roundXhr'

import AnalyseCtrl from './AnalyseCtrl'

export default function pgnExport(ctrl: AnalyseCtrl) {
  if (!ctrl.menu.s.computingPGN) {
    ctrl.menu.s.computingPGN = true
    if (ctrl.source === 'online') {
      getPGN(ctrl.data.game.id)
      .then((pgn: string) => {
        ctrl.menu.s.computingPGN = false
        redraw()
        window.plugins.socialsharing.share(pgn)
      })
      .catch(e => {
        ctrl.menu.s.computingPGN = false
        redraw()
        handleXhrError(e)
      })
    } else {
      const endSituation = ctrl.tree.lastNode()
      const white = ctrl.data.player.color === 'white' ?
      (ctrl.data.game.id === 'offline_ai' ? session.appUser('Anonymous') : 'Anonymous') :
      (ctrl.data.game.id === 'offline_ai' ? ctrl.data.opponent.username : 'Anonymous')
      const black = ctrl.data.player.color === 'black' ?
      (ctrl.data.game.id === 'offline_ai' ? session.appUser('Anonymous') : 'Anonymous') :
      (ctrl.data.game.id === 'offline_ai' ? ctrl.data.opponent.username : 'Anonymous')
      chess.pgnDump({
        variant: ctrl.data.game.variant.key,
        initialFen: ctrl.data.game.initialFen,
        pgnMoves: endSituation.pgnMoves || [],
        white,
        black
      })
      .then((res: chess.PgnDumpResponse) => {
        ctrl.menu.s.computingPGN = false
        redraw()
        window.plugins.socialsharing.share(res.pgn)
      })
      .catch(e => {
        ctrl.menu.s.computingPGN = false
        redraw()
        console.error(e)
      })
    }
  }
}

