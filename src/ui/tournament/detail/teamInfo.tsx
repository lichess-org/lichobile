import { Prop, prop } from '~/utils'
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
  teamId: Prop<string | null>
}

export default {
  controller(root: TournamentCtrl): TeamInfoCtrl {
    let isOpen = false
    const teamId = prop<string | null>(null)

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
        h('tr.list_item.bglight', {key: player.user.id}, [
          h('td.teamPlayerRank', index + 1),
          h('td.teamPlayerName', player.user.name),
          h('td.teamPlayerScore', player.score)
          ])
      )
    }

    return (
      h('div.modal.tournamentInfoModal', {id: 'tournamentTeamInfoModal', oncreate: helper.slidesInLeft}, [
        h('header', [
          h('buton.modal_close', {oncreate: helper.ontap(helper.slidesOutRight(ctrl.close, 'tournamentTeamInfoModal'))}, [
            closeIcon
          ]),
          h('h2.tournamentModalHeader', [
            h('span', [
              teamStanding.rank + '. '
            ]),
            h('span.ttc-' + ctrl.root.teamColorMap[teamId], [
              teamName + ' '
            ]),
            h('span', [
              '(' + teamStanding.score + ')'
            ])
          ])
        ]),
        h('div.modal_content', [
          h('div.tournamentTeamPlayers', [
            h('table.tournamentModalTable', [
              teamStanding.players.map(renderPlayer)
            ])
          ])
        ])
      ])
    )
  }
}
