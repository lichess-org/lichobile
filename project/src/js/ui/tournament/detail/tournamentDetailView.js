import { header as headerWidget, backButton } from '../../shared/common';
import session from '../../../session';
import layout from '../../layout';
import m from 'mithril';
import i18n from '../../../i18n';
import { noop, gameIcon, formatTournamentCountdown, formatTournamentDuration, formatTournamentTimeControl } from '../../../utils';
import faq from '../faq';
import playerInfo from '../playerInfo';
import helper from '../../helper';
import settings from '../../../settings';
import miniBoard from '../../shared/miniBoard';

export default function view(ctrl) {
  const headerCtrl = headerWidget.bind(undefined, null,
    backButton(ctrl.tournament() ? ctrl.tournament().fullName : null)
  );

  const body = tournamentBody.bind(undefined, ctrl);
  const footer = renderFooter.bind(undefined, ctrl);
  const faqOverlay = renderFAQOverlay.bind(undefined, ctrl);
  const playreInfoOverlay = renderPlayerInfoOverlay.bind(undefined, ctrl);
  const overlay = () => [faqOverlay(), playreInfoOverlay()];

  return layout.free(headerCtrl, body, footer, overlay);
}

function renderFAQOverlay(ctrl) {
  return [
    faq.view(ctrl.faqCtrl)
  ];
}

function renderPlayerInfoOverlay(ctrl) {
  return [
    playerInfo.view(ctrl.playerInfoCtrl)
  ];
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

function renderFooter(ctrl) {
  if (!ctrl.tournament()) {
    return null;
  }

  return (
    <div className="actions_bar">
      <button key="faq" className="action_bar_button" config={helper.ontouch(ctrl.faqCtrl.open)}>
        <span className="fa fa-question-circle" />
        FAQ
      </button>
      { ctrl.hasJoined() ? withdrawButton(ctrl) : joinButton(ctrl) }
    </div>
  );
}

function tournamentContentFinished(ctrl) {
  const data = ctrl.tournament();
  return [
    tournamentHeader(data, null, null),
    data.podium ? tournamentPodium(data.podium) : null,
    tournamentLeaderboard(ctrl)
  ];
}

function tournamentContentCreated(ctrl) {
  const data = ctrl.tournament();
  return [
    tournamentHeader(data, data.secondsToStart, 'Starts in:'),
    tournamentLeaderboard(ctrl)
  ];
}

function tournamentContentStarted(ctrl) {
  const data = ctrl.tournament();
  return [
      tournamentHeader(data, data.secondsToFinish, ''),
      tournamentLeaderboard(ctrl),
      data.featured ? tournamentFeaturedGame(ctrl) : ''
  ];
}

function tournamentHeader(data, time, timeText) {
  const variant = variantDisplay(data);
  const control = formatTournamentTimeControl(data.clock);
  return (
    <div key="header" className="tournamentHeader">
      <div className="tournamentInfoTime">
        <strong className="tournamentInfo" data-icon={gameIcon(variantKey(data))}>
          {variant + ' • ' + control + ' • ' + formatTournamentDuration(data.minutes) }
        </strong>
        <div className="timeInfo">
          <strong> {timeInfo(time, timeText)} </strong>
        </div>
      </div>
      <div className="tournamentCreatorInfo">
        { data.createdBy === 'lichess' ? i18n('tournamentOfficial') : i18n('by', data.createdBy) }
        &nbsp;•&nbsp;
        { window.moment(data.startsAt).calendar() }
      </div>
   </div>
  );
}

function joinButton(ctrl) {
  if (!session.isConnected() || ctrl.tournament().isFinished || settings.game.supportedVariants.indexOf(ctrl.tournament().variant) < 0) {
    return null;
  }

  return (
    <button key="join" className="action_bar_button" config={helper.ontouch(() => ctrl.join(ctrl.tournament().id))}>
      <span className="fa fa-play" />
      {i18n('join')}
    </button>
  );
}

function withdrawButton(ctrl) {
  if (ctrl.tournament().isFinished || settings.game.supportedVariants.indexOf(ctrl.tournament().variant) < 0) {
    return null;
  }
  return (
    <button key="withdraw" className="action_bar_button" config={helper.ontouch(() => ctrl.withdraw(ctrl.tournament().id))}>
      <span className="fa fa-flag" />
      {i18n('withdraw')}
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

function timeInfo(time, preceedingText) {
  if (!time) return '';

  return preceedingText + ' ' + formatTournamentCountdown(time);
}

function tournamentLeaderboard(ctrl) {
  const data = ctrl.tournament();
  const players = data.standing.players;
  const page = data.standing.page;
  const firstPlayer = (players.length > 0) ? players[0].rank : 0;
  const lastPlayer = (players.length > 0) ? players[players.length-1].rank : 0;
  const backEnabled = page > 1;
  const forwardEnabled = page < data.nbPlayers/10;
  const isUserPage = data.me && (page === Math.ceil(data.me.rank/10));
  const user = session.get();
  const userName = user ? user.username : '';

  return (
    <div key="leaderboard" className='tournamentLeaderboard'>
      <p className='tournamentTitle'> {i18n('leaderboard')} ({data.nbPlayers} Players)</p>

      <table className='tournamentStandings'>
        {data.standing.players.map(renderLeaderboardItem.bind(undefined, ctrl.playerInfoCtrl, userName))}
      </table>

      <div key={'navigationButtons' + page} className={'navigationButtons' + (players.length < 1 ? ' invisible' : '')}>
        {renderNavButton('W', !ctrl.isLoading() && backEnabled, () => ctrl.reload(data.id, 1))}
        {renderNavButton('Y', !ctrl.isLoading() && backEnabled, () => ctrl.reload(data.id, page - 1))}
        <span class='pageInfo'> {firstPlayer + '-' + lastPlayer + ' / ' + data.nbPlayers} </span>
        {renderNavButton('X', !ctrl.isLoading() && forwardEnabled, () => ctrl.reload(data.id, page + 1))}
        {renderNavButton('V', !ctrl.isLoading() && forwardEnabled, () => ctrl.reload(data.id, Math.ceil(data.nbPlayers/10)))}
        <button className={'navigationButton me' + (data.me ? '' : ' invisible ') + (isUserPage ? ' activated' : '')}
          data-icon='7'
          config={!ctrl.isLoading() && data.me ? helper.ontouch(() => ctrl.reload(data.id, Math.ceil(data.me.rank/10))) : noop}
        >
          <span>Me</span>
        </button>
      </div>
    </div>
  );
}

function renderNavButton(icon, isEnabled, action) {
  return (
    <button className={'navigationButton' + (isEnabled ? '' : ' disabled')}
      data-icon={icon} config={isEnabled ? helper.ontouch(action) : noop} />
  );
}

function renderLeaderboardItem (playerInfoCtrl, userName, player) {
  const isMe = player.name === userName;
  return (
    <tr key={player.name} className={'list_item' + (isMe ? ' me' : '')} config={helper.ontouchY(playerInfoCtrl.open.bind(undefined, player))}>
      <td className='tournamentPlayer'>
        <span className="flagRank" data-icon={player.withdraw ? 'b' : ''}> {player.withdraw ? '' : (player.rank + '. ')} </span>
        <span> {player.name + ' (' + player.rating + ') '} {helper.progress(player.ratingDiff)} </span>
      </td>
      <td className='tournamentPoints'>
        <span className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>
          {player.score}
        </span>
      </td>
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
      <div key={featured.id} className='tournamentMiniBoard'>
        {m.component(miniBoard, {
          bounds: miniBoardSize(isPortrait),
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


function miniBoardSize(isPortrait) {
  const { vh, vw } = helper.viewportDim();
  const side = isPortrait ? vw * 0.66 : vh * 0.66;
  const bounds = {
    height: side,
    width: side
  };
  return bounds;
}

function tournamentPodium(podium) {
  return (
    <div key="podium" className="podium">
      { renderPlace(podium[1]) }
      { renderPlace(podium[0]) }
      { renderPlace(podium[2]) }
    </div>
  );
}

function renderPlace(data) {
  // tournament can exist with only 2 players
  if (!data) return null;

  const rank = data.rank;
  return (
    <div className={'place'+rank}>
      <div className="trophy"> </div>
      <div className="username" config={helper.ontouch(() => m.route('/@/' + data.name))}>
        {data.name}
      </div>
      <div className="rating"> {data.rating} {helper.progress(data.ratingDiff)} </div>
      <table className="stats">
        <tr>
          <td className="statName">
            {i18n('gamesPlayed')}
          </td>
          <td className="statData">
            {data.nb.game}
          </td>
        </tr>
        <tr>
          <td className="statName">
            Win Rate
          </td>
          <td className="statData">
            {((data.nb.win/data.nb.game)*100).toFixed(0) + '%'}
          </td>
        </tr>
        <tr>
          <td className="statName">
            Berserk Rate
          </td>
          <td className="statData">
            {((data.nb.berserk/data.nb.game)*100).toFixed(0) + '%'}
          </td>
        </tr>
        <tr>
          <td className="statName">
            Performance
          </td>
          <td className="statData">
            {data.performance}
          </td>
        </tr>
      </table>
    </div>
  );
}
