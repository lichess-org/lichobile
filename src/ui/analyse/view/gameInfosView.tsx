import i18n from '../../../i18n'
import { playerName } from '../../../lichess/player'
import * as gameApi from '../../../lichess/game'
import gameStatusApi from '../../../lichess/status'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'

export default function renderGameInfos(ctrl: AnalyseCtrl) {
  const player = ctrl.data.player
  const opponent = ctrl.data.opponent
  if (!player || !opponent) return null

  return (
    <div className="analyse-gameInfos native_scroller">
      <div className="analyseOpponent">
        <div className="analysePlayerName">
          <span className={'color-icon ' + player.color} />
          {playerName(player, true)}
          {helper.renderRatingDiff(player)}
        </div>
      </div>
      <div className="analyseOpponent">
        <div className="analysePlayerName">
          <span className={'color-icon ' + opponent.color} />
          {playerName(opponent, true)}
          {helper.renderRatingDiff(opponent)}
        </div>
      </div>
      <div className="gameInfos">
        {ctrl.formattedDate ? ctrl.formattedDate : null}
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

