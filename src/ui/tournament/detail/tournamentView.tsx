import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import m from 'mithril'
import router from '../../../router'
import session from '../../../session'
import i18n from '../../../i18n'
import { Tournament, StandingPlayer, PodiumPlace, Spotlight, Verdicts, TeamStanding } from '../../../lichess/interfaces/tournament'
import { Opening } from '../../../lichess/interfaces/game'
import { formatTournamentDuration, formatTournamentTimeControl } from '../../../utils'
import * as helper from '../../helper'
import settings from '../../../settings'
import MiniBoard from '../../shared/miniBoard'
import CountdownTimer from '../../shared/CountdownTimer'

import faq from '../faq'
import playerInfo from './playerInfo'
import teamInfo from './teamInfo'
import joinForm from './joinForm'
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

export function renderTeamInfoOverlay(ctrl: TournamentCtrl) {
  return [
    teamInfo.view(ctrl.teamInfoCtrl)
  ]
}

export function tournamentBody(ctrl: TournamentCtrl) {
  const data = ctrl.tournament
  if (!data) return null

  return h('div.tournamentContainer.native_scroller.page', {
    className: (data.podium ? 'finished ' : '') + (data.teamBattle ? 'teamBattle' : ''),
  }, [
    tournamentHeader(data, ctrl),
    data.podium && !data.teamBattle ? tournamentPodium(data.podium) : null,
    data.teamBattle ? tournamentTeamLeaderboard(ctrl) : null,
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
      <button key="faqButton" className="action_bar_button" oncreate={helper.ontap(ctrl.faqCtrl.open)}>
        <span className="fa fa-question-circle" />
        FAQ
      </button>
      <button key="shareButton" className="action_bar_button" oncreate={helper.ontap(() => Plugins.LiShare.share({ url: tUrl }))}>
        <span className="fa fa-share-alt" />
        Share
      </button>
      { ctrl.hasJoined ? withdrawButton(ctrl, t) : joinButton(ctrl, t) }
    </div>
  )
}

export function timeInfo(seconds?: number, preceedingText?: string) {
  if (seconds === undefined) return null

  return [
    preceedingText ? (preceedingText + ' ') : null,
    h(CountdownTimer, { seconds })
  ]
}

function tournamentHeader(data: Tournament, ctrl: TournamentCtrl) {
  return (
    <div className="tournamentHeader">
      {tournamentTimeInfo(data)}
      {data.spotlight ? tournamentSpotlightInfo(data.spotlight) : null}
      {tournamentCreatorInfo(data, ctrl.startsAt!)}
      {data.position ? tournamentPositionInfo(data.position) : null}
      {data.verdicts.list.length > 0 ? tournamentConditions(data.verdicts) : null}
      {teamBattleNoTeam(data)}
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
      &thinsp;•&thinsp;{startsAt}
    </div>
  )
}

function tournamentPositionInfo(position: Opening) {
  return (
    <div className={'tournamentPositionInfo' + (position.wikiPath ? ' withLink' : '')}
      oncreate={helper.ontapY(() => position && position.wikiPath &&
        window.open(`https://en.wikipedia.org/wiki/${position.wikiPath}`, '_blank')
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

function teamBattleNoTeam(t: Tournament) {
  if (t.isFinished || !t.teamBattle || t.teamBattle.joinWith.length > 0) {
    return null
  }
  else {
    return (
      <div className="tournamentNoTeam">
        <span className="withIcon" data-icon="7" />
        <p>
          You must join one of these teams to participate!
        </p>
      </div>
    )
  }
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
    !t.verdicts.accepted ||
    (t.teamBattle && t.teamBattle.joinWith.length === 0)) {
    return m.fragment({key: 'noJoinButton'}, [])
  }
  const action = (t.private || t.teamBattle) ?
    () => joinForm.open(ctrl) :
    () => ctrl.join()

  return (
    <button key="joinButton" className="action_bar_button" oncreate={helper.ontap(action)}>
      <span className="fa fa-play" />
      {i18n('join')}
    </button>
  )
}

function withdrawButton(ctrl: TournamentCtrl, t: Tournament) {
  if (t.isFinished || settings.game.supportedVariants.indexOf(t.variant) < 0) {
    return m.fragment({key: 'noWithdrawButton'}, [])
  }
  return (
    <button key="withdrawButton" className="action_bar_button" oncreate={helper.ontap(ctrl.withdraw)}>
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
  const tb = data.teamBattle

  return (
    <div className="tournamentLeaderboard">

      <ul
        className={'tournamentStandings box' + (ctrl.isLoadingPage ? ' loading' : '')}
        oncreate={helper.ontap(e => handlePlayerInfoTap(ctrl, e!), undefined, undefined, getLeaderboardItemEl)}
      >
        {players.map((p, i) => renderPlayerEntry(userName, p, i, p.team ? ctrl.teamColorMap[p.team] : 0, p.team && tb ? tb.teams[p.team] : ''))}
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

function renderPlayerEntry(userName: string, player: StandingPlayer, i: number, teamColor?: number, teamName?: string) {
  const evenOrOdd = i % 2 === 0 ? 'even' : 'odd'
  const isMe = player.name === userName
  const ttc = teamColor ? teamColor : 0

  return (
    <li key={player.name} data-player={player.name} className={`list_item tournament-list-item ${evenOrOdd}` + (isMe ? ' tournament-me' : '')} >
      <div className="tournamentIdentity">
        <span className="flagRank" data-icon={player.withdraw ? 'b' : ''}> {player.withdraw ? '' : (player.rank + '.')} &thinsp; </span>
        <span className="playerName"> {player.name + ' (' + player.rating + ')'}</span>
        <span className={'playerTeam ttc-' + ttc}> {teamName ? teamName : '' } </span>
      </div>
      <div className={'tournamentPoints ' + (player.sheet.fire ? 'on-fire' : 'off-fire')} data-icon="Q">
        {player.score}
      </div>
    </li>
  )
}

function tournamentFeaturedGame(ctrl: TournamentCtrl) {
  const data = ctrl.tournament
  const featured = data.featured
  if (!featured) return null

  return (
    <div className="tournamentGames">
      <div className="tournamentMiniBoard">
        {h(MiniBoard, {
          fixed: false,
          fen: featured.fen,
          lastMove: featured.lastMove,
          orientation: featured.orientation,
          link: () => router.set(`/tournament/${data.id}/game/${featured.id}?color=${featured.orientation}&goingBack=1`),
          gameObj: featured,
        })}
      </div>
    </div>
  )
}

function tournamentPodium(podium: ReadonlyArray<PodiumPlace>) {
  return (
    <div className="podium">
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
            {i18n('performance')}
          </td>
          <td className="statData">
            {data.performance}
          </td>
        </tr>
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
            {i18n('winRate')}
          </td>
          <td className="statData">
            {((data.nb.win / data.nb.game) * 100).toFixed(0) + '%'}
          </td>
        </tr>
        <tr>
          <td className="statName">
            {i18n('berserkRate')}
          </td>
          <td className="statData">
            {((data.nb.berserk / data.nb.game) * 100).toFixed(0) + '%'}
          </td>
        </tr>
      </table>
    </div>
  )
}

function tournamentTeamLeaderboard(ctrl: TournamentCtrl) {
  const t = ctrl.tournament
  const tb = t.teamBattle
  const standings = t.teamStanding
  if (!tb || !standings)
    return null

  return (
    <div className="tournamentTeamLeaderboard">
      <ul
        className={'tournamentTeamStandings box'}
        oncreate={helper.ontap(e => handleTeamInfoTap(ctrl, e!), undefined, undefined, getTeamLeaderboardItemEl)}
      >
        {standings.map((team, i) => renderTeamEntry(tb.teams[team.id], ctrl.teamColorMap[team.id], team, i))}
      </ul>
    </div>
  )
}

function renderTeamEntry(teamName: string | undefined, teamColor: number | undefined, team: TeamStanding, i: number) {
  if (!teamName)
    return null
  const ttc = teamColor ? teamColor : 0
  const evenOrOdd = i % 2 === 0 ? 'even' : 'odd'
  return (
    <li key={team.id} data-team={team.id} className={`list_item tournament-list-item ${evenOrOdd}`} >
      <div className="tournamentIdentity">
        <span> {team.rank + '.'} &thinsp; </span>
        <span className={'ttc-' + ttc}> {teamName} </span>
      </div>
      <div className={'tournamentPoints'}>
        {team.score}
      </div>
    </li>
  )
}

function getTeamLeaderboardItemEl(e: Event) {
  const target = e.target as HTMLElement
  return (target as HTMLElement).classList.contains('list_item') ? target :
    helper.findParentBySelector(target, '.list_item')
}

function handleTeamInfoTap(ctrl: TournamentCtrl, e: Event) {
  const el = getTeamLeaderboardItemEl(e)
  const teamId = el.dataset['team']

  if (teamId) ctrl.teamInfoCtrl.open(teamId)
}
