import * as h from 'mithril/hyperscript'
import router from '../../../router'
import session from '../../../session'
import i18n from '../../../i18n'
import { Tournament, StandingPlayer, PodiumPlace, Spotlight, Verdicts } from '../../../lichess/interfaces/tournament'
import { Opening } from '../../../lichess/interfaces/game'
import { formatTournamentDuration, formatTournamentTimeControl } from '../../../utils'
import * as helper from '../../helper'
import settings from '../../../settings'
import miniBoard from '../../shared/miniBoard'
import CountdownTimer from '../../shared/CountdownTimer'

import faq from '../faq'
import playerInfo from './playerInfo'
import passwordForm from './passwordForm'
import TournamentCtrl from './TournamentCtrl'

export function renderFAQOverlay(ctrl: TournamentCtrl) {
  return [
    faq.view(ctrl.faqCtrl)
  ]
}

export function renderPlayerInfoOverlay(ctrl: TournamentCtrl) {
  return [
    playerInfo.view(ctrl.playerInfoCtrl)
  ]
}

export function tournamentBody(ctrl: TournamentCtrl) {
  const data = ctrl.tournament
  if (!data) return null

  return h('div.tournamentContainer.native_scroller.page', [
    tournamentHeader(data, ctrl),
    data.podium ? tournamentPodium(data.podium) : null,
    tournamentLeaderboard(ctrl),
    data.featured ? tournamentFeaturedGame(ctrl) : null
  ])
}

export function renderFooter(ctrl: TournamentCtrl) {
  const t = ctrl.tournament
  if (!t) return null
  const tUrl = 'https://lichess.org/tournament/' + t.id

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
      { ctrl.hasJoined ? withdrawButton(ctrl, t) : joinButton(ctrl, t) }
    </div>
  )
}

export function timeInfo(key: string, seconds?: number, preceedingText?: string) {
  if (seconds === undefined) return null

  return [
    preceedingText ? (preceedingText + ' ') : null,
    h(CountdownTimer, { key, seconds })
  ]
}

function tournamentHeader(data: Tournament, ctrl: TournamentCtrl) {
  return (
    <div key="header" className="tournamentHeader">
      {tournamentTimeInfo(data)}
      {data.spotlight ? tournamentSpotlightInfo(data.spotlight) : null}
      {tournamentCreatorInfo(data, ctrl.startsAt!)}
      {data.position ? tournamentPositionInfo(data.position) : null}
      {data.verdicts.list.length > 0 ? tournamentConditions(data.verdicts) : null}
   </div>
  )
}

function tournamentTimeInfo(data: Tournament) {
  const variant = data.perf.name
  const control = formatTournamentTimeControl(data.clock)
  return (
    <div className="tournamentTimeInfo">
      <strong className="tournamentInfo withIcon" data-icon={data.perf.icon}>
        {variant + ' • ' + control + ' • ' + formatTournamentDuration(data.minutes)}
      </strong>
    </div>
  )
}

function tournamentCreatorInfo(data: Tournament, startsAt: string) {
  return (
    <div className="tournamentCreatorInfo">
      {data.createdBy === 'lichess' ? i18n('tournamentOfficial') : i18n('by', data.createdBy)}
      &nbsp;•&nbsp;{startsAt}
    </div>
  )
}

function tournamentPositionInfo(position: Opening) {
  return (
    <div className={'tournamentPositionInfo' + (position.wikiPath ? ' withLink' : '')}
      oncreate={helper.ontapY(() => position && position.wikiPath &&
        window.open(`https://en.wikipedia.org/wiki/${position.wikiPath}`)
      )}
    >
      {position.eco + ' ' + position.name}
    </div>
  )
}

function tournamentConditions(verdicts: Verdicts) {
  const conditionsClass = [
    'tournamentConditions',
    session.isConnected() ? '' : 'anonymous',
    verdicts.accepted ? 'accepted' : 'rejected'
  ].join(' ')
  return (
    <div className={conditionsClass}>
      <span className="withIcon" data-icon="7" />
      <div className="conditions_list">
      {verdicts.list.map(o => {
        return (
          <p className={'condition ' + (o.verdict === 'ok' ? 'accepted' : 'rejected')}>
            {o.condition}
          </p>
        )
      })}
      </div>
    </div>
  )
}

function tournamentSpotlightInfo(spotlight: Spotlight) {
  return (
    <div className="tournamentSpotlightInfo">
      {spotlight.description}
    </div>
  )
}

function joinButton(ctrl: TournamentCtrl, t: Tournament) {
  if (!session.isConnected() ||
    t.isFinished ||
    settings.game.supportedVariants.indexOf(t.variant) < 0 ||
    !t.verdicts.accepted) {
    return null
  }

  const action = ctrl.tournament.private ?
    () => passwordForm.open(ctrl) :
    () => ctrl.join()

  return (
    <button key="join" className="action_bar_button" oncreate={helper.ontap(action)}>
      <span className="fa fa-play" />
      {i18n('join')}
    </button>
  )
}

function withdrawButton(ctrl: TournamentCtrl, t: Tournament) {
  if (t.isFinished || settings.game.supportedVariants.indexOf(t.variant) < 0) {
    return null
  }
  return (
    <button key="withdraw" className="action_bar_button" oncreate={helper.ontap(ctrl.withdraw)}>
      <span className="fa fa-flag" />
      {i18n('withdraw')}
    </button>
  )
}

function getLeaderboardItemEl(e: Event) {
  const target = e.target as HTMLElement
  return (target as HTMLElement).classList.contains('list_item') ? target :
    helper.findParentBySelector(target, '.list_item')
}

function handlePlayerInfoTap(ctrl: TournamentCtrl, e: Event) {
  const el = getLeaderboardItemEl(e)
  const playerId = el.dataset['player']

  if (playerId) ctrl.playerInfoCtrl.open(playerId)
}

function tournamentLeaderboard(ctrl: TournamentCtrl) {
  const data = ctrl.tournament
  const players = ctrl.currentPageResults
  const page = ctrl.page
  const firstPlayer = (players.length > 0) ? players[0].rank : 0
  const lastPlayer = (players.length > 0) ? players[players.length - 1].rank : 0
  const backEnabled = page > 1
  const forwardEnabled = page < data.nbPlayers / 10
  const user = session.get()
  const userName = user ? user.username : ''

  return (
    <div key="leaderboard" className="tournamentLeaderboard">
      { data.nbPlayers > 0 ?
        <p className="tournamentTitle"> {i18n('leaderboard')} ({i18n('nbConnectedPlayers', data.nbPlayers)})</p> : null
      }

      <ul
        className={'tournamentStandings' + (ctrl.isLoadingPage ? ' loading' : '')}
        oncreate={helper.ontap(e => handlePlayerInfoTap(ctrl, e!), undefined, undefined, getLeaderboardItemEl)}
      >
        {players.map(p => renderPlayerEntry(userName, p))}
      </ul>
      <div className={'navigationButtons' + (players.length < 1 ? ' invisible' : '')}>
        {renderNavButton('W', !ctrl.isLoadingPage && backEnabled, ctrl.first)}
        {renderNavButton('Y', !ctrl.isLoadingPage && backEnabled, ctrl.prev)}
        <span class="pageInfo"> {firstPlayer + '-' + lastPlayer + ' / ' + data.nbPlayers} </span>
        {renderNavButton('X', !ctrl.isLoadingPage && forwardEnabled, ctrl.next)}
        {renderNavButton('V', !ctrl.isLoadingPage && forwardEnabled, ctrl.last)}
        {data.me ?
          <button className={'navigationButton tournament-me' + (ctrl.focusOnMe ? ' activated' : '')}
            data-icon="7"
            oncreate={helper.ontap(ctrl.toggleFocusOnMe)}
          >
            <span>Me</span>
          </button> : null
        }
      </div>
    </div>
  )
}

function renderNavButton(icon: string, isEnabled: boolean, action: () => void) {
  return h('button.navigationButton', {
    'data-icon': icon,
    oncreate: helper.ontap(action),
    disabled: !isEnabled
  })
}

function renderPlayerEntry(userName: string, player: StandingPlayer) {
  const isMe = player.name === userName
  return (
    <li key={player.name} data-player={player.name} className={'list_item tournament-list-player' + (isMe ? ' tournament-me' : '')} >
      <div className="tournamentPlayer">
        <span className="flagRank" data-icon={player.withdraw ? 'b' : ''}> {player.withdraw ? '' : (player.rank + '. ')} </span>
        <span> {player.name + ' (' + player.rating + ') '} </span>
      </div>
      <span className={'tournamentPoints ' + player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon="Q">
        {player.score}
      </span>
    </li>
  )
}

function tournamentFeaturedGame(ctrl: TournamentCtrl) {
  const data = ctrl.tournament
  const featured = data.featured
  if (!featured) return null

  const isPortrait = helper.isPortrait()

  featured.player = {user: {username: featured.white.name}, rating: featured.white.rating}
  featured.opponent = {user: {username: featured.black.name}, rating: featured.black.rating}
  featured.clock = {initial: data.clock.limit, increment: data.clock.increment}

  return (
    <div className="tournamentGames">
      <p className="tournamentTitle tournamentFeatured">Featured Game</p>
      <div key={featured.id} className="tournamentMiniBoard">
        {h(miniBoard, {
          bounds: miniBoardSize(isPortrait),
          fixed: false,
          fen: featured.fen,
          lastMove: featured.lastMove,
          orientation: 'white',
          link: () => router.set(`/tournament/${data.id}/game/${featured.id}?goingBack=1`),
          gameObj: featured,
          delay: 800,
        })}
      </div>
    </div>
  )
}


function miniBoardSize(isPortrait: boolean) {
  const { vh, vw } = helper.viewportDim()
  const side = isPortrait ? vw * 0.66 : vh * 0.66
  const bounds = {
    height: side,
    width: side
  }
  return bounds
}

function tournamentPodium(podium: ReadonlyArray<PodiumPlace>) {
  return (
    <div key="podium" className="podium">
      { renderPlace(podium[1]) }
      { renderPlace(podium[0]) }
      { renderPlace(podium[2]) }
    </div>
  )
}

function renderPlace(data: PodiumPlace) {
  // tournament can exist with only 2 players
  if (!data) return null

  const rank = data.rank
  return (
    <div className={'place' + rank}>
      <div className="trophy"> </div>
      <div className="username" oncreate={helper.ontap(() => router.set('/@/' + data.name))}>
        {data.name}
      </div>
      <div className="rating"> {data.rating} </div>
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
            {((data.nb.win / data.nb.game) * 100).toFixed(0) + '%'}
          </td>
        </tr>
        <tr>
          <td className="statName">
            Berserk Rate
          </td>
          <td className="statData">
            {((data.nb.berserk / data.nb.game) * 100).toFixed(0) + '%'}
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
  )
}
