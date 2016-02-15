import * as utils from '../../utils';
import h from '../helper';
import { header as headerWidget, backButton, empty} from '../shared/common';
import layout from '../layout';
import m from 'mithril';

export default function view(ctrl) {
  const headerCtrl = utils.partialf(headerWidget, null,
    backButton(ctrl.tournament().fullName)
  );
  const bodyCtrl = tournamentBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, empty, empty);
}

function tournamentBody(ctrl) {
  let data = ctrl.tournament();
  let body = null;

  if (!data.isStarted)
    body = tournamentBodyCreated(data);
  else if (data.isFinished)
    body = tournamentBodyFinished(data);
  else
    body = tournamentBodyStarted(data);

  return (body);
}

function tournamentBodyCreated(data) {
  return (
    <div className="tournamentContainer">
      { tournamentLeaderboard(data, false) }
    </div>
  );
}

function tournamentBodyFinished(data) {
  return (
    <div className="tournamentContainer">
      { tournamentLeaderboard(data, true) }
    </div>
  );
}

function tournamentBodyStarted(data) {
  return (
    <div className="tournamentContainer">
      { tournamentLeaderboard(data, false) }
      { tournamentFeaturedGame(data) }
    </div>
  );
}

function tournamentLeaderboard(data) {
  return (
    <div className="tournamentLeaderboard">
      <p className="tournamentHeader">Leaderboard ({data.nbPlayers} Players)</p>
      <table className="tournamentStandings">
        {data.standing.players.map(renderLeaderboardItem)}
      </table>
    </div>
  );
}

function tournamentFeaturedGame(data) {
  return (
    <div className="tournamentGames">
      <p className="tournamentHeader">Featured Game</p>
      <div class="tournamentFeatured nav" config={h.ontouchY(() => m.route('/game/' + data.featured.id))}>
        {data.featured.white.name} ({data.featured.white.rating}) vs. {data.featured.black.name} ({data.featured.black.rating})
      </div>
    </div>
  );
}

function renderLeaderboardItem(player) {
  return (
    <tr className="tournamentListItem">
      <td className="tournamentPlayer">{player.name + '(' + player.rating + ')'}</td>
      <td className="tournamentPoints"><strong className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</strong></td>
    </tr>
  );
}
