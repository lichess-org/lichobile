import * as utils from '../../utils';
import h from '../helper';
import { header as headerWidget, backButton, pad} from '../shared/common';
import layout from '../layout';
import m from 'mithril';
import i18n from '../../i18n';
import isEmpty from 'lodash/isEmpty';

export default function view(ctrl) {
  const headerCtrl = utils.partialf(headerWidget, null,
    backButton(ctrl.tournament().fullName)
  );
  const bodyCtrl = tournamentBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl);
}

function tournamentBody(ctrl) {
  let data = ctrl.tournament();
  if (isEmpty(data)) return null;

  let body = null;
  if (data.isFinished)
    body = tournamentContentFinished(data);
  else if (!data.isStarted)
    body = tournamentContentCreated(data);
  else
    body = tournamentContentStarted(data);

  return (
    <div class="tournamentContainer native_scroller page">
      {body}
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

function tournamentContentCreated(data) {
  return (
    <div>
      { tournamentHeader(data, data.secondsToStart, 'Starts in:')}
      { tournamentLeaderboard(data, false) }
    </div>
  );
}

function tournamentContentStarted(data) {
  return (
    <div>
      { tournamentHeader(data, data.secondsToFinish, '')}
      { tournamentLeaderboard(data, false) }
      { data.featured ? tournamentFeaturedGame(data) : '' }
    </div>
  );
}

function tournamentHeader(data, time, timeText) {
  let variant = variantInfo(data);
  let control = timeControl(data);
  return (
    <div className='basicTournamentInfo'>
      <strong> {variant + ' • ' + control + ' • ' + data.minutes + 'M' } </strong>
      <div className='timeInfo'>
        <strong> {timeInfo(time, timeText)} </strong>
      </div>
    </div>
  );
}

function variantInfo(data) {
  let variant = data.variant;
  if(variant === 'standard') {
    if(data.schedule)
      variant = data.schedule.speed;
    else if(data.position)
      variant = data.position.name;
    else
      variant = '';
  }

  variant = variant.split(' ')[0]; // Cut off names to first word

  if (variant.length > 0)
    variant = variant.charAt(0).toUpperCase() + variant.substring(1);

  return variant;
}

function timeControl(data) {
  let limit = (data.clock.limit / 60);
  if (data.clock.limit === 30)
    limit = '½';
  else if (data.clock.limit === 45)
    limit = '¾';
  return limit + '+' + data.clock.increment;
}

function timeInfo(time, preceedingText) {
  if (!time) return '';

  let timeStr = '';
  let hours = Math.floor(time / 60 / 60);
  let mins = Math.floor(time / 60) - (hours * 60);
  let secs = time % 60;
  if (hours > 0)
    timeStr = preceedingText + ' ' + hours + ':' + pad(mins, 2) + ':' + pad(secs, 2);
  else
    timeStr = preceedingText + ' ' + mins + ':' + pad(secs, 2);
  return timeStr;
}

function tournamentLeaderboard(data, showTrophies) {
  return (
    <div className='tournamentLeaderboard'>
      <p className='tournamentTitle'> {i18n('leaderboard')} ({data.nbPlayers} Players)</p>
      <table className='tournamentStandings'>
        {data.standing.players.map(createLeaderboardItemRenderer(showTrophies))}
      </table>
    </div>
  );
}

function createLeaderboardItemRenderer(showTrophies) {
  function renderLeaderboardItem(player, index) {
    const podiumRank = index + 1;
    let trophy = '';
    if (showTrophies && podiumRank < 4) {
      trophy = 'trophy-' + podiumRank;
    }
    return (
      <tr key={player.name} className='list_item'>
        <td className='tournamentPlayer'><span className={trophy}>{player.name + ' (' + player.rating + ')'}</span></td>
        <td className='tournamentPoints'><span className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</span></td>
      </tr>
    );
  }
  return renderLeaderboardItem;
}

function tournamentFeaturedGame(data) {
  return (
    <div className='tournamentGames'>
      <p className='tournamentTitle'>Featured Game</p>
      <div class='featuredGame nav' config={h.ontouchY(() => m.route('/game/' + data.featured.id))}>
          {data.featured.white.name} ({data.featured.white.rating}) vs. {data.featured.black.name} ({data.featured.black.rating})
      </div>
    </div>
  );
}
