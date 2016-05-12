import { header as headerWidget, pad, backButton } from '../../shared/common';
import layout from '../../layout';
import m from 'mithril';
import i18n from '../../../i18n';
import { gameIcon } from '../../../utils';
import helper from '../../helper';
import settings from '../../../settings';
import miniBoard from '../../shared/miniBoard';

export default function view(ctrl) {
  const headerCtrl = headerWidget.bind(undefined, null,
    backButton(ctrl.tournament() ? ctrl.tournament().fullName : null)
  );

  const bodyCtrl = tournamentBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, renderFooter.bind(undefined, ctrl));
}

function tournamentBody(ctrl) {
  const data = ctrl.tournament();

  if (!data) return null;

  let body;

  if (data.isFinished) {
    body = tournamentContentFinished(ctrl);
  }
  else if (!data.isStarted) {
    body = tournamentContentCreated(ctrl);
  }
  else {
    body = tournamentContentStarted(ctrl);
  }

  return (
    <div class="tournamentContainer native_scroller page withFooter">
      {body}
    </div>
  );
}

function tournamentContentFinished(ctrl) {
  const data = ctrl.tournament();
  return (
    <div>
      { tournamentHeader(data, null, null)}
      { tournamentPodium (data.podium) }
      { tournamentLeaderboard(ctrl) }
    </div>
  );
}

function tournamentContentCreated(ctrl) {
  const data = ctrl.tournament();
  return (
    <div>
      { tournamentHeader(data, data.secondsToStart, 'Starts in:')}
      { tournamentLeaderboard(ctrl) }
    </div>
  );
}

function tournamentContentStarted(ctrl) {
  const data = ctrl.tournament();

  return (
    <div>
      { tournamentHeader(data, data.secondsToFinish, '')}
      { tournamentLeaderboard(ctrl) }
      { data.featured ? tournamentFeaturedGame(ctrl) : '' }
    </div>
  );
}

function tournamentHeader(data, time, timeText) {
  const variant = variantDisplay(data);
  const control = timeControl(data);
  return (
    <div className='tournamentInfoTime'>
     <strong className='tournamentInfo' data-icon={gameIcon(variantKey(data))} > {variant + ' • ' + control + ' • ' + data.minutes + 'M' } </strong>
     <div className='timeInfo'>
       <strong> {timeInfo(time, timeText)} </strong>
     </div>
   </div>
  );
}

function tournamentJoinWithdraw(ctrl) {
  const label = ctrl.hasJoined() ? i18n('withdraw') : i18n('join');
  const icon = 'fa ' + (ctrl.hasJoined() ? 'fa-flag' : 'fa-play');

  function buttonAction () {
    if (ctrl.hasJoined()) {
      ctrl.withdraw(ctrl.tournament().id);
    }
    else {
      ctrl.join(ctrl.tournament().id);
    }
  }

  if (ctrl.tournament().isFinished || settings.game.supportedVariants.indexOf(ctrl.tournament().variant) < 0) {
    return null;
  }

  return (
    <button className="action_bar_button" config={helper.ontouch(buttonAction)}>
      <span className={icon} />
      {label}
    </button>
  );
}

function variantDisplay(data) {
  let variant = variantKey(data);

  variant = variant.split(' ')[0]; // Cut off names to first word

  if (variant.length > 0) {
    variant = variant.charAt(0).toUpperCase() + variant.substring(1);
  }

  return variant;
}

function variantKey(data) {
  let variant = data.variant;
  if (variant === 'standard') {
    variant = data.perf.name.toLowerCase();
  }
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
  const hours = Math.floor(time / 60 / 60);
  const mins = Math.floor(time / 60) - (hours * 60);
  const secs = time % 60;
  if (hours > 0)
    timeStr = preceedingText + ' ' + hours + ':' + pad(mins, 2) + ':' + pad(secs, 2);
  else
    timeStr = preceedingText + ' ' + mins + ':' + pad(secs, 2);
  return timeStr;
}

function tournamentLeaderboard(ctrl) {
  const data = ctrl.tournament();
  return (
    <div className='tournamentLeaderboard'>
      <p className='tournamentTitle'> {i18n('leaderboard')} ({data.nbPlayers} Players)</p>
      <table className='tournamentStandings'>
        {data.standing.players.map(renderLeaderboardItem)}
      </table>
    </div>
  );
}

function renderLeaderboardItem(player) {
  return (
    <tr key={player.name} className='list_item'>
      <td className='tournamentPlayer'><span>{player.rank + '. ' + player.name + ' (' + player.rating + ') '} {helper.progress(player.ratingDiff)} </span></td>
      <td className='tournamentPoints'><span className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</span></td>
    </tr>
  );
}

function tournamentFeaturedGame(ctrl) {
  const data = ctrl.tournament();
  const featured = data.featured;
  if (!featured) return null;

  const isPortrait = helper.isPortrait();

  featured.player = {user: {username: featured.white.name}, rating: featured.white.rating};
  featured.opponent = {user: {username: featured.black.name}, rating: featured.black.rating};
  featured.clock = {initial: data.clock.limit, increment: data.clock.increment};

  return (
    <div className='tournamentGames'>
      <p className='tournamentTitle'>Featured Game</p>
      <div className='tournamentMiniBoard'>
        {m.component(miniBoard, {
          bounds: helper.miniBoardSize(isPortrait),
          fen: featured.fen,
          lastMove: featured.lastMove,
          orientation: 'white',
          link: () => m.route('/tournament/' + data.id + '/game/' + featured.id),
          gameObj: featured}
        )}
      </div>
    </div>
  );
}

function renderFooter(ctrl) {
  return (
    <div className="actions_bar">
      {tournamentJoinWithdraw(ctrl)}
    </div>
  );
}

function tournamentPodium(podium) {
  return (
    <div className="podium">
      { renderPlace(podium[1]) }
      { renderPlace(podium[0]) }
      { renderPlace(podium[2]) }
    </div>
  );
}

function renderPlace(data) {
  const rank = data.rank;

  return (
    <div className={'place'+rank}>
      <div className="trophy"> </div>
      <div className="username" config={helper.ontouch(() => m.route('/@/' + data.name))}>
        {data.name}
      </div>
      <div className="rating"> {data.rating}
        <div className={'progress' + (data.ratingDiff >= 0 ? 'positive' : 'negative')}>
          {data.ratingDiff}
        </div>
      </div>
      <table className="stats">
        <tr>
          <td>
            Games Played
          </td>
          <td>
            {data.nb.game}
          </td>
        </tr>
        <tr>
          <td>
            Win Rate
          </td>
          <td>
            {(data.nb.win/data.nb.game).toFixed(0) + '%'}
          </td>
        </tr>
        <tr>
          <td>
            Berserk Rate
          </td>
          <td>
            {(data.nb.berserk/data.nb.game).toFixed(0) + '%'}
          </td>
        </tr>
        <tr>
          <td>
            Performance
          </td>
          <td>
            {data.performance}
          </td>
        </tr>
      </table>
    </div>
  );
}
