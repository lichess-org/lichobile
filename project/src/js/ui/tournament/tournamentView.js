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

  let body = null;
  if (data.isFinished)
    body = tournamentContentFinished(data);
  else if (!data.isStarted)
    body = tournamentContentCreated(data);
  else
    body = tournamentContentStarted(data);

  return (m('.tournamentContainer', body));
}

function tournamentContentCreated(data) {
  return (
    <div>
      { tournamentHeader(data, data.secondsToStart, 'Starting in:')}
      { tournamentLeaderboard(data, false) }
    </div>
  );
}

function tournamentContentFinished(data) {
  return (
    <div>
      { tournamentHeader(data, null, null)}
      { tournamentLeaderboard(data, true) }
    </div>
  );
}

function tournamentContentStarted(data) {
  return (
    <div>
      { tournamentHeader(data, data.secondsToFinish, 'Remaining:')}
      { tournamentLeaderboard(data, false) }
      { tournamentFeaturedGame(data) }
    </div>
  );
}

function tournamentHeader(data, time, timeText) {
  let variant = data.variant;
  if(variant === 'standard')
    variant = data.schedule.speed;
  variant = variant.charAt(0).toUpperCase() + variant.substring(1);
  return (
    <div className='basicTournamentInfo'>
      <strong> {variant + ' • ' + (data.clock.limit / 60) + '+' + data.clock.increment + ' • ' + data.minutes + 'M' } </strong>
      <div className='timeInfo'>
        <strong> {timeInfo(time, timeText)} </strong>
      </div>
    </div>
  );
}

function timeInfo(time, preceedingText) {
  if (!time) return '';

  let mins = Math.floor(time / 60);
  let secs = time % 60;
  return (preceedingText + ' ' + mins + ':' + pad(secs, 2));
}

function pad(num, size) {
    var s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
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
      <td className='tournamentPlayer'><span className={trophy}>{player.name + ' (' + player.rating + ')'}</span></td>
      <td className='tournamentPoints'><span className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</span></td>
    </tr>
  );
}
