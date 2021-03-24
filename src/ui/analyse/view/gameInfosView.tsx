import h from 'mithril/hyperscript'
import i18n from '../../../i18n'
import router from '../../../router'
import { playerName } from '../../../lichess/player'
import * as gameApi from '../../../lichess/game'
import gameStatusApi from '../../../lichess/status'
import * as helper from '../../helper'

import { AutoplayDelay } from '../autoplay'
import AnalyseCtrl from '../AnalyseCtrl'

interface AutoplaySpeed {
  name: string
  delay: AutoplayDelay
}

const baseSpeeds: AutoplaySpeed[] = [{
  name: 'fast',
  delay: 1000
}, {
  name: 'slow',
  delay: 5000
}]

const realtimeSpeed: AutoplaySpeed = {
  name: 'realtimeReplay',
  delay: 'realtime'
}

const cplSpeed: AutoplaySpeed = {
  name: 'byCPL',
  delay: 'cpl'
}

export default function renderGameInfos(ctrl: AnalyseCtrl) {
  const player = ctrl.data.player
  const opponent = ctrl.data.opponent
  if (!player || !opponent) return null

  return (
    <div className="analyse-gameInfos native_scroller">
      <div className="analyseOpponent li-button"
        oncreate={helper.ontapXY(() => player.user && router.set(`/@/${player.user.id}/`))}
      >
        <div className="analysePlayerName">
          <span className={'color-icon ' + player.color} />
          {playerName(player, true)}
          {helper.renderRatingDiff(player)}
          {player.berserk ? <span data-icon="`" /> : null }
        </div>
      </div>
      <div className="analyseOpponent li-button"
        oncreate={helper.ontapXY(() => opponent.user && router.set(`/@/${opponent.user.id}/`))}
      >
        <div className="analysePlayerName">
          <span className={'color-icon ' + opponent.color} />
          {playerName(opponent, true)}
          {helper.renderRatingDiff(opponent)}
          {opponent.berserk ? <span data-icon="`" /> : null }
        </div>
      </div>
      <div className="gameInfos">
        {ctrl.formattedDate ? ctrl.formattedDate : null}
        { ctrl.data.game.source === 'import' && ctrl.data.game.importedBy ?
          <div>Imported by {ctrl.data.game.importedBy}</div> : null
        }
      </div>
      {gameStatusApi.finished(ctrl.data) ? renderStatus(ctrl) : null}
      { ctrl.data.tournament ?
        <div className="analyse-tournamentInfo li-button"
          oncreate={helper.ontapXY(() => ctrl.data.tournament && router.set(`/tournament/${ctrl.data.tournament.id}`))}
        >
          <span className="fa fa-trophy" />
          {ctrl.data.tournament.name + ' Arena'}
        </div> : null
      }
      <h2 className="analyse-tabContentTitle">{i18n('replayMode')}</h2>
      {autoplayButtons(ctrl)}
    </div>
  )
}

function renderStatus(ctrl: AnalyseCtrl) {
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner)
  return (
    <div className="status">
      {gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.turns, ctrl.data.game.winner, ctrl.data.game.variant.key)}

      {winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : null}
    </div>
  )
}

function autoplayButtons(ctrl: AnalyseCtrl) {
  const d = ctrl.data
  const hasRealtime = d.game.speed !== 'correspondence' && d.game.moveCentis
    && d.game.moveCentis.length !== 0
  const speeds = [
    ...baseSpeeds,
    ...(hasRealtime ? [realtimeSpeed] : []),
    ...(d.analysis ? [cplSpeed] : [])
  ]
  return h('div.analyse-autoplay', speeds.map(speed => {
    return h('button.buttonMetal', {
      oncreate: helper.ontap(() => ctrl.autoplay.toggle(speed.delay)),
    }, i18n(speed.name))
  }))
}

