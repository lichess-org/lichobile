import h from 'mithril/hyperscript'
import router from '../../../router'
import * as utils from '../../../utils'
import redraw from '../../../utils/redraw'
import * as helper from '../../helper'
import { PlayerInfo, PlayerInfoPairing } from '../../../lichess/interfaces/tournament'
import i18n from '../../../i18n'
import { closeIcon } from '../../shared/icons'

import * as xhr from '../tournamentXhr'
import TournamentCtrl from './TournamentCtrl'

export interface PlayerInfoCtrl {
  open: (playerId: string) => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  root: TournamentCtrl
  playerData: utils.Prop<PlayerInfo | null>
}

export default {
  controller(root: TournamentCtrl): PlayerInfoCtrl {
    let isOpen = false
    const playerData = utils.prop<PlayerInfo | null>(null)

    function open(playerId: string) {
      xhr.playerInfo(root.tournament.id, playerId)
      .then(data => {
        playerData(data)
        router.backbutton.stack.push(helper.slidesOutRight(close, 'tournamentPlayerInfoModal'))
        isOpen = true
        redraw()
      })
      .catch(utils.handleXhrError)
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
      playerData
    }
  },

  view: function(ctrl: PlayerInfoCtrl) {
    if (!ctrl.isOpen()) return null

    const tournament = ctrl.root.tournament
    if (!tournament) return null

    const playerData = ctrl.playerData()
    if (!playerData) return null

    const player = playerData.player
    const pairings = playerData.pairings
    const avgOpRating = pairings.length ? (pairings.reduce((prev, x) => prev + x.op.rating, 0) / pairings.length).toFixed(0) : '0'


    function renderPlayerGame(game: PlayerInfoPairing, index: number) {
      let outcome: string | number
      let outcomeClass = 'oppOutcome'
      if (game.score === undefined || game.score === null) {
        outcome = '*'
      }
      else if (Array.isArray(game.score)) {
        outcome = game.score[0]
        if (game.score[1] === 2)
          outcomeClass += ' streak'
        else if (game.score[1] === 3)
          outcomeClass += ' double'
      }
      else {
        outcome = game.score
      }
      return (
        <tr className="list_item bglight" data-id={game.id} data-color={game.color} key={game.id}>
          <td className="oppRank"> {pairings.length - index} </td>
          <td className="oppName"> {game.op.name} </td>
          <td className="oppRating"> {game.op.rating} </td>
          <td className="oppColor"> <span className={'color-icon ' + game.color}> </span> </td>
          <td className={outcomeClass}> {outcome} </td>
        </tr>
      )
    }

    return (
      <div className="modal tournamentInfoModal" id="tournamentPlayerInfoModal" oncreate={helper.slidesInLeft}>
        <header>
          <button className="modal_close"
            oncreate={helper.ontap(helper.slidesOutRight(ctrl.close, 'tournamentPlayerInfoModal'))}
          >
            { closeIcon }
          </button>
          <h2 className="tournamentModalHeader">
            {player.rank + '. ' + player.name + ' (' + player.rating + ') '}
          </h2>
        </header>
        <div className="modal_content">
          <div className="tournamentPlayerInfo">
            <table className="tournamentModalStats">
              <tr>
                <td className="statName">
                  {i18n('gamesPlayed')}
                </td>
                <td className="statData">
                  {player.nb.game}
                </td>
              </tr>
              <tr>
                <td className="statName">
                  {i18n('winRate')}
                </td>
                <td className="statData">
                  {player.nb.game ? ((player.nb.win / player.nb.game) * 100).toFixed(0) + '%' : '0%'}
                </td>
              </tr>
              <tr>
                <td className="statName">
                  {i18n('berserkRate')}
                </td>
                <td className="statData">
                  {player.nb.game ? ((player.nb.berserk / player.nb.game) * 100).toFixed(0) + '%' : '0%'}
                </td>
              </tr>
              <tr>
                <td className="statName">
                  Average Opponent
                </td>
                <td className="statData">
                  {avgOpRating}
                </td>
              </tr>
              <tr className={player.performance ? '' : 'invisible'}>
                <td className="statName">
                  {i18n('performance')}
                </td>
                <td className="statData">
                  {player.performance}
                </td>
              </tr>
            </table>
          </div>
          <div className="tournamentPlayerGames">
            <table className="tournamentModalTable"
              oncreate={helper.ontapY(e => {
                const el = helper.getTR(e)
                if (el) {
                  const id = el.dataset.id
                  const color = el.dataset.color
                  router.set(`/game/${id}?color=${color}&goingBack=1`)
                }
              }, undefined, helper.getTR)}
            >
              {pairings.map(renderPlayerGame)}
            </table>
          </div>
        </div>
      </div>
    )
  }
}
