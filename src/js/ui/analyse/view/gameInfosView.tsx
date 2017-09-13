import * as h from 'mithril/hyperscript'
import * as utils from '../../../utils'
import i18n from '../../../i18n'
import { formatClockTime } from '../../shared/round/clock/clockView'
import * as gameApi from '../../../lichess/game'
import gameStatusApi from '../../../lichess/status'
import CrazyPocket from '../../shared/round/crazy/CrazyPocket'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'


export function renderSyntheticPockets(ctrl: AnalyseCtrl) {
  const player = ctrl.data.player
  const opponent = ctrl.data.opponent
  return (
    <div className="analyse-gameInfosWrapper synthetic">
      <div className="analyseOpponent">
        <div className="analysePlayerName">
          <span className={'color-icon ' + player.color} />
          {player.color}
        </div>
        {ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: player.color,
          position: 'top'
        }) : null}
      </div>
      <div className="analyseOpponent">
        <div className="analysePlayerName">
          <span className={'color-icon ' + opponent.color} />
          {opponent.color}
        </div>
        {ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: opponent.color,
          position: 'bottom'
        }) : null}
      </div>
    </div>
  )
}

export function renderGameInfos(ctrl: AnalyseCtrl, isPortrait: boolean) {
  const player = ctrl.data.player
  const opponent = ctrl.data.opponent
  if (!player || !opponent) return null

  const isCrazy = ctrl.data.game.variant.key === 'crazyhouse'

  return (
    <div className="analyse-gameInfosWrapper">
      <div className="analyseOpponent">
        <div className={'analysePlayerName' + (isCrazy ? ' crazy' : '')}>
          <span className={'color-icon ' + player.color} />
          {utils.playerName(player, true)}
          {helper.renderRatingDiff(player)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.node && ctrl.node.checkCount ?
            ' +' + getChecksCount(ctrl, player.color) : null
          }
        </div>
        {ctrl.data.clock && (!isCrazy || !isPortrait) ?
          <div className="analyseClock">
            {formatClockTime(ctrl.data.clock[player.color] * 1000, false)}
            <span className="fa fa-clock-o" />
          </div> : null
        }
        {isCrazy && ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: player.color,
          position: 'top'
        }) : null}
      </div>
      <div className="analyseOpponent">
        <div className={'analysePlayerName' + (isCrazy ? ' crazy' : '')}>
          <span className={'color-icon ' + opponent.color} />
          {utils.playerName(opponent, true)}
          {helper.renderRatingDiff(opponent)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.node && ctrl.node.checkCount ?
            ' +' + getChecksCount(ctrl, opponent.color) : null
          }
        </div>
        {ctrl.data.clock && (!isCrazy || !isPortrait) ?
          <div className="analyseClock">
            {formatClockTime(ctrl.data.clock[opponent.color] * 1000, false)}
            <span className="fa fa-clock-o" />
          </div> : null
        }
        {isCrazy && ctrl.node && ctrl.node.crazyhouse ? h(CrazyPocket, {
          ctrl: { chessground: ctrl.chessground, canDrop: ctrl.canDrop },
          crazyData: ctrl.node.crazyhouse,
          color: opponent.color,
          position: 'bottom'
        }) : null}
      </div>
      <div className="gameInfos">
        {ctrl.vm.formattedDate ? ctrl.vm.formattedDate : null}
        { ctrl.data.game.source === 'import' && ctrl.data.game.importedBy ?
          <div>Imported by {ctrl.data.game.importedBy}</div> : null
        }
      </div>
      {gameStatusApi.finished(ctrl.data) ? renderStatus(ctrl) : null}
    </div>
  )
}

function renderStatus(ctrl: AnalyseCtrl) {
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner)
  return (
    <div key="gameStatus" className="status">
      {gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key)}

      {winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : null}
    </div>
  )
}

function getChecksCount(ctrl: AnalyseCtrl, color: Color) {
  const node = ctrl.node
  return node && node.checkCount && node.checkCount[utils.oppositeColor(color)]
}

