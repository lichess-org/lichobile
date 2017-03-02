import { header as headerWidget, backButton } from '../../shared/common';
import router from '../../../router';
import session from '../../../session';
import layout from '../../layout';
import * as h from 'mithril/hyperscript';
import i18n from '../../../i18n';
import { gameIcon, formatTimeInSecs, formatTournamentDuration, formatTournamentTimeControl } from '../../../utils';
import faq from '../faq';
import playerInfo from '../playerInfo';
import * as helper from '../../helper';
import settings from '../../../settings';
import miniBoard from '../../shared/miniBoard';
import { TournamentState } from '../interfaces';
import { Tournament, StandingPlayer, PodiumPlace } from '../../../lichess/interfaces/tournament';
import passwordForm from './passwordForm';

export default function view(vnode: Mithril.Vnode<{}, TournamentState>) {
  const ctrl = vnode.state as TournamentState;

  if (ctrl.notFound()) {
    return layout.free(
      () => headerWidget(null, backButton(i18n('tournamentNotFound'))),
      () =>
        <div key="tournament-not-found" className="tournamentNotFound">
          <p>{i18n('tournamentDoesNotExist')}</p>
          <p>{i18n('tournamentMayHaveBeenCanceled')}</p>
        </div>
    )
  }

  const headerCtrl = () => headerWidget(null,
    backButton(ctrl.tournament() ? ctrl.tournament().fullName : null)
  );
  const bodyCtrl = () => tournamentBody(ctrl);
  const footer = () => renderFooter(ctrl);
  const faqOverlay = () => renderFAQOverlay(ctrl);
  const playerInfoOverlay = () => renderPlayerInfoOverlay(ctrl);
  const overlay = () => [
    faqOverlay(),
    playerInfoOverlay(),
    passwordForm.view()
  ];

  return layout.free(headerCtrl, bodyCtrl, footer, overlay);
}

function renderFAQOverlay(ctrl: TournamentState) {
  return [
    faq.view(ctrl.faqCtrl)
  ];
}

function renderPlayerInfoOverlay(ctrl: TournamentState) {
  return [
    playerInfo.view(ctrl.playerInfoCtrl)
  ];
}

function tournamentBody(ctrl: TournamentState) {
  const data = ctrl.tournament();

  if (!data) return null;

  let body: Mithril.Children;

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

function renderFooter(ctrl: TournamentState) {
  const t = ctrl.tournament()
  if (!t) return null
  const tUrl = 'https://lichess.org/tournament/' + t.id;

  return (
    <div className="actions_bar">
      <button key="faq" className="action_bar_button" oncreate={helper.ontap(ctrl.faqCtrl.open)}>
        <span className="fa fa-question-circle" />
        FAQ
      </button>
      <button key="share" className="action_bar_button" oncreate={helper.ontap(() => window.plugins.socialsharing.share(tUrl))}>
        <span className="fa fa-share-alt" />
        Share
      </button>
      { ctrl.hasJoined() ? withdrawButton(ctrl, t) : joinButton(ctrl, t) }
    </div>
  );
}

function tournamentContentFinished(ctrl: TournamentState) {
  const data = ctrl.tournament();
  return [
    tournamentHeader(data),
    data.podium ? tournamentPodium(data.podium) : null,
    tournamentLeaderboard(ctrl)
  ];
}

function tournamentContentCreated(ctrl: TournamentState) {
  const data = ctrl.tournament();
  return [
    tournamentHeader(data, data.secondsToStart, 'Starts in:'),
    tournamentLeaderboard(ctrl)
  ];
}

function tournamentContentStarted(ctrl: TournamentState) {
  const data = ctrl.tournament();
  return [
      tournamentHeader(data, data.secondsToFinish, ''),
      tournamentLeaderboard(ctrl),
      data.featured ? tournamentFeaturedGame(ctrl) : ''
  ];
}

function tournamentHeader(data: Tournament, time?: number, timeText?: string) {
  const variant = variantDisplay(data);
  const control = formatTournamentTimeControl(data.clock);
  const conditionsClass = [
    'tournamentConditions',
    session.isConnected() ? '' : 'anonymous',
    data.verdicts.accepted ? 'accepted' : 'rejected'
  ].join(' ');
  return (
    <div key="header" className="tournamentHeader">
      <div className="tournamentInfoTime clearfix">
        <strong className="tournamentInfo withIcon" data-icon={gameIcon(variantKey(data))}>
          {variant + ' • ' + control + ' • ' + formatTournamentDuration(data.minutes) }
        </strong>
        <div className="timeInfo">
          <strong> {timeInfo(time, timeText)} </strong>
        </div>
      </div>
      { data.verdicts.list.length > 0 ?
        <div className={conditionsClass} data-icon="7">
          { data.verdicts.list.map(o => {
            return (
              <p className={'condition' + (o.accepted ? 'accepted' : 'rejected')}>
                { o.condition }
              </p>
            );
          })}
        </div> : null
      }
      <div className="tournamentCreatorInfo">
        { data.createdBy === 'lichess' ? i18n('tournamentOfficial') : i18n('by', data.createdBy) }
        &nbsp;•&nbsp;
        { window.moment(data.startsAt).calendar() }
      </div>
      { data.position ?
      <div className={'tournamentPositionInfo' + (data.position.wikiPath ? ' withLink' : '')}
        oncreate={helper.ontapY(() => data.position && data.position.wikiPath &&
          window.open(`https://en.wikipedia.org/wiki/${data.position.wikiPath}`)
        )}
      >
        {data.position.eco + ' ' + data.position.name}
      </div> : null
      }
   </div>
  );
}

function joinButton(ctrl: TournamentState, t: Tournament) {
  if (!session.isConnected() ||
    t.isFinished ||
    settings.game.supportedVariants.indexOf(t.variant) < 0 ||
    !t.verdicts.accepted) {
    return null;
  }

  const action = ctrl.tournament().private ?
    () => passwordForm.open(ctrl) :
    () => ctrl.join(t.id)

  return (
    <button key="join" className="action_bar_button" oncreate={helper.ontap(action)}>
      <span className="fa fa-play" />
      {i18n('join')}
    </button>
  );
}

function withdrawButton(ctrl: TournamentState, t: Tournament) {
  if (t.isFinished || settings.game.supportedVariants.indexOf(t.variant) < 0) {
    return null;
  }
  return (
    <button key="withdraw" className="action_bar_button" oncreate={helper.ontap(() => ctrl.withdraw(t.id))}>
      <span className="fa fa-flag" />
      {i18n('withdraw')}
    </button>
  );
}

function variantDisplay(data: Tournament) {
  let variant = variantKey(data);
  variant = variant.split(' ')[0]; // Cut off names to first word

  if (variant.length > 0) {
    variant = variant.charAt(0).toUpperCase() + variant.substring(1);
  }

  return variant;
}

function variantKey(data: Tournament) {
  let variant = data.variant;
  if (variant === 'standard') {
    variant = data.perf.name.toLowerCase();
  }
  return variant;
}

function timeInfo(time?: number, preceedingText?: string) {
  if (time === undefined) return ''

  return (preceedingText ? preceedingText : '') + ' ' + formatTimeInSecs(time);
}

function getLeaderboardItemEl(e: Event) {
  const target = e.target as HTMLElement
  return (target as HTMLElement).classList.contains('list_item') ? target :
    helper.findParentBySelector(target, '.list_item');
}

function handlePlayerInfoTap(ctrl: TournamentState, e: Event) {
  const el = getLeaderboardItemEl(e);
  const playerId = el.dataset['player'];

  ctrl.playerInfoCtrl.open(playerId);
}

function tournamentLeaderboard(ctrl: TournamentState) {
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

      <table
        className={'tournamentStandings' + (ctrl.isLoading() ? ' loading' : '')}
        oncreate={helper.ontap(e => handlePlayerInfoTap(ctrl, e!), undefined, undefined, getLeaderboardItemEl)}
      >
        {data.standing.players.map(p =>
          renderLeaderboardItem(userName, p)
        )}
      </table>

      <div className={'navigationButtons' + (players.length < 1 ? ' invisible' : '')}>
        {renderNavButton('W', !ctrl.isLoading() && backEnabled, ctrl.first)}
        {renderNavButton('Y', !ctrl.isLoading() && backEnabled, ctrl.prev)}
        <span class='pageInfo'> {firstPlayer + '-' + lastPlayer + ' / ' + data.nbPlayers} </span>
        {renderNavButton('X', !ctrl.isLoading() && forwardEnabled, ctrl.next)}
        {renderNavButton('V', !ctrl.isLoading() && forwardEnabled, ctrl.last)}
        <button className={'navigationButton tournament-me' + (data.me ? '' : ' invisible ') + (isUserPage ? ' activated' : '')}
          data-icon='7'
          oncreate={helper.ontap(ctrl.me)}
        >
          <span>Me</span>
        </button>
      </div>
    </div>
  );
}

function renderNavButton(icon: string, isEnabled: boolean, action: () => void) {
  const state = isEnabled ? 'enabled' : 'disabled';
  return (
    <button className={`navigationButton ${state}`}
      data-icon={icon} oncreate={helper.ontap(action)} />
  );
}

function renderLeaderboardItem (userName: string, player: StandingPlayer) {
  const isMe = player.name === userName;
  return (
    <tr key={player.name} data-player={player.name} className={'list_item' + (isMe ? ' tournament-me' : '')} >
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

function tournamentFeaturedGame(ctrl: TournamentState) {
  const data = ctrl.tournament();
  const featured = data.featured;
  if (!featured) return null;

  const isPortrait = helper.isPortrait();

  featured.player = {user: {username: featured.white.name}, rating: featured.white.rating};
  featured.opponent = {user: {username: featured.black.name}, rating: featured.black.rating};
  featured.clock = {initial: data.clock.limit, increment: data.clock.increment};

  return (
    <div className='tournamentGames'>
      <p className='tournamentTitle tournamentFeatured'>Featured Game</p>
      <div key={featured.id} className='tournamentMiniBoard'>
        {h(miniBoard, {
          bounds: miniBoardSize(isPortrait),
          fen: featured.fen,
          lastMove: featured.lastMove,
          orientation: 'white',
          link: () => router.set('/tournament/' + data.id + '/game/' + featured.id),
          gameObj: featured}
        )}
      </div>
    </div>
  );
}


function miniBoardSize(isPortrait: boolean) {
  const { vh, vw } = helper.viewportDim();
  const side = isPortrait ? vw * 0.66 : vh * 0.66;
  const bounds = {
    height: side,
    width: side
  };
  return bounds;
}

function tournamentPodium(podium: Array<PodiumPlace>) {
  return (
    <div key="podium" className="podium">
      { renderPlace(podium[1]) }
      { renderPlace(podium[0]) }
      { renderPlace(podium[2]) }
    </div>
  );
}

function renderPlace(data: PodiumPlace) {
  // tournament can exist with only 2 players
  if (!data) return null;

  const rank = data.rank;
  return (
    <div className={'place'+rank}>
      <div className="trophy"> </div>
      <div className="username" oncreate={helper.ontap(() => router.set('/@/' + data.name))}>
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
