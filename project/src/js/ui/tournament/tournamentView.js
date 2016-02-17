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
  if(!data) return null;

  console.log(data);

  let topBody = commonBody(data);

  let specificBody = null;
  if (data.isFinished)
    specificBody = tournamentBodyFinished(data);
  else if (!data.isStarted)
    specificBody = tournamentBodyCreated(data);
  else
    specificBody = tournamentBodyStarted(data);

  return (m('.tournamentContainer', [topBody, specificBody]));
}

function commonBody(data) {
  let variant = data.variant;
  if(variant === 'standard')
    variant = data.schedule.speed;
  variant = variant.charAt(0).toUpperCase() + variant.substring(1);
  return (
    <div className='basicTournamentInfo'>
      <strong> {variant + ' • ' + (data.clock.limit / 60) + '+' + data.clock.increment + ' • ' + data.minutes + 'M' } </strong>
    </div>
  );
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

function tournamentLeaderboard(data, trophies) {
  let leaderboardData = data.standing.players.map(renderLeaderboardItem, trophies);
  return (
    <div className="tournamentLeaderboard">
      <p className="tournamentHeader">Leaderboard ({data.nbPlayers} Players)</p>
      <table className="tournamentStandings">
        {leaderboardData}
      </table>
    </div>
  );
}

function tournamentFeaturedGame(data) {
  return (
    <div className="tournamentGames">
      <p className="tournamentHeader">Featured Game</p>
      <div class="featuredGame nav" config={h.ontouchY(() => m.route('/game/' + data.featured.id))}>
        {data.featured.white.name} ({data.featured.white.rating}) vs. {data.featured.black.name} ({data.featured.black.rating})
      </div>
    </div>
  );
}

function renderLeaderboardItem(player, podiumRank) {
  podiumRank = podiumRank + 1;
  let trophy = '';
  if (this && podiumRank < 4) {
    trophy = 'trophy-' + podiumRank;
  }
  return (
    <tr key={player.name} className="list_item">
      <td className='tournamentPlayer'><strong className={trophy}>{player.name + ' (' + player.rating + ')'}</strong></td>
      <td className='tournamentPoints'><strong className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</strong></td>
    </tr>
  );
}
