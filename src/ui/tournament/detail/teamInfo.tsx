import Stream from 'mithril/stream'
import router from '../../../router'
import redraw from '../../../utils/redraw'
import * as helper from '../../helper'
import { TeamStandingPlayer } from '../../../lichess/interfaces/tournament'
import TournamentCtrl from './TournamentCtrl'
import h from 'mithril/hyperscript'
import { closeIcon } from '../../shared/icons'

export interface TeamInfoCtrl {
  open: (playerId: string) => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  root: TournamentCtrl
  teamId: Stream<string>
}

export default {
  controller(root: TournamentCtrl): TeamInfoCtrl {
    let isOpen = false
    const teamId = Stream<string>()

    function open(tId: string) {
      router.backbutton.stack.push(helper.slidesOutRight(close, 'tournamentTeamInfoModal'))
      teamId(tId)
      isOpen = true
      redraw()
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      isOpen() {
        return isOpen
      },
      root,
      teamId
    }
  },

  view: function(ctrl: TeamInfoCtrl) {
    if (!ctrl.isOpen()) return null

    const t = ctrl.root.tournament
    const teamId = ctrl.teamId()
    if (!t || !t.teamBattle || !t.teamStanding || !teamId) return null

    const teamName = t.teamBattle.teams[teamId]
    const teamStanding = t.teamStanding.find(a => a.id === teamId)
    if (!teamName || !teamStanding) return null

    function renderPlayer(player: TeamStandingPlayer, index: number) {
      return (
        <tr className="list_item bglight" key={player.user.id}>
          <td className="teamPlayerRank"> {index + 1} </td>
          <td className="teamPlayerName"> {player.user.name} </td>
          <td className="teamPlayerScore"> {player.score} </td>
        </tr>
      )
    }

    return (
      <div className="modal tournamentInfoModal" id="tournamentTeamInfoModal" oncreate={helper.slidesInLeft}>
        <header>
          <button className="modal_close"
            oncreate={helper.ontap(helper.slidesOutRight(ctrl.close, 'tournamentTeamInfoModal'))}
          >
            { closeIcon }
          </button>
          <h2 className="tournamentModalHeader">
            <span> {teamStanding.rank + '.' } &thinsp; </span>
            <span class={'ttc-' + ctrl.root.teamColorMap[teamId]}> {teamName} &thinsp; </span>
            <span> {'(' + teamStanding.score + ')'} </span>
          </h2>
        </header>
        <div className="modal_content">
          <div className="tournamentTeamPlayers">
            <table className="tournamentModalTable">
              {teamStanding.players.map(renderPlayer)}
            </table>
          </div>
        </div>
      </div>
    )
  }
}
