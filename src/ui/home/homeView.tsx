import * as h from 'mithril/hyperscript'
import router from '../../router'
import { emptyFen } from '../../utils/fen'
import { hasNetwork } from '../../utils'
import i18n from '../../i18n'
import session from '../../session'
import spinner from '../../spinner'
import { CorrespondenceSeek } from '../../lichess/interfaces'
import * as helper from '../helper'
import { renderTimelineEntry, timelineOnTap } from '../timeline'
import MiniBoard from '../shared/miniBoard'
import TabNavigation from '../shared/TabNavigation'
import TabView from '../shared/TabView'
import { renderQuickSetup } from '../newGameForm'
import newGameForm from '../newGameForm'
import { renderTournamentList } from '../tournament/tournamentsListView'

import HomeCtrl from './HomeCtrl'

export function body(ctrl: HomeCtrl) {
  const nbPlayers = i18n('nbConnectedPlayers', ctrl.nbConnectedPlayers || '?')
  const nbGames = i18n('nbGamesInPlay', ctrl.nbGamesInPlay || '?')

  const playbanEndsAt = session.currentBan()

  if (!hasNetwork()) {
    const puzzleData = ctrl.offlinePuzzle
    const boardConf = puzzleData ? {
      fen: puzzleData.puzzle.fen,
      orientation: puzzleData.puzzle.color,
      link: () => router.set('/training'),
    } : null

    return (
      <div className={'native_scroller homeOfflineWrapper' + (boardConf ? ' withBoard' : '')}>
        <div className="homeOffline">
          <section className="playOffline">
            <h2>{i18n('playOffline')}</h2>
            <button className="fatButton" oncreate={helper.ontapY(() => router.set('/ai'))}>{i18n('playOfflineComputer')}</button>
            <button className="fatButton" oncreate={helper.ontapY(() => router.set('/otb'))}>{i18n('playOnTheBoardOffline')}</button>
          </section>
          { boardConf ?
          <section className="miniPuzzle">
            <h2 className="homeTitle">{i18n('training')}</h2>
            {h(MiniBoard, boardConf)}
          </section> : undefined
          }
        </div>
      </div>
    )
  }

  return (
    <div className="native_scroller page">
      <div className="home">
        {playbanEndsAt && ((playbanEndsAt.valueOf() - Date.now()) / 1000) > 1 ?
          renderPlayban(playbanEndsAt) : renderLobby(ctrl)
        }
        <div className="stats">
          <div className="numPlayers">{nbPlayers}</div>
          <div className="numGames">{nbGames}</div>
        </div>
        {renderFeaturedTournaments(ctrl)}
        {renderDailyPuzzle(ctrl)}
        {renderTimeline(ctrl)}
      </div>
    </div>
  )
}

function renderLobby(ctrl: HomeCtrl) {
  const tabsContent = [
    () => renderQuickSetup(() => newGameForm.openRealTime('custom')),
    () => renderCorresPool(ctrl),
  ]

  return h('div.homeCreate', [
    h(TabNavigation, {
      buttons: [
        {
          label: 'Quick setup'
        },
        {
          label: i18n('correspondence')
        }
      ],
      selectedIndex: ctrl.selectedTab,
      onTabChange: ctrl.onTabChange,
      wrapperClass: 'homeSetup',
      withBottomBorder: true,
    }),
    h(TabView, {
      selectedIndex: ctrl.selectedTab,
      contentRenderers: tabsContent,
      onTabChange: ctrl.onTabChange,
      className: 'setupTabView',
      withWrapper: true,
    }),
  ])
}

function renderCorresPool(ctrl: HomeCtrl) {
  return h('div.corresPoolWrapper.native_scroller', ctrl.corresPool ?
    ctrl.corresPool.length ?
      h('table.corres_seeks', [
        h('thead', [
          h('tr', [
            h('th', ''),
            h('th', 'Player'),
            h('th', 'Rating'),
            h('th', 'Time'),
            h('th', 'Mode'),
          ]),
        ]),
        h('tbody', ctrl.corresPool.map(s => renderSeek(ctrl, s)))
      ]) :
      h('div.corres_empty_seeks_list', 'Oops! Nothing here.') :
    h('div.corres_empty_seeks_list', spinner.getVdom('monochrome')))
}

function renderSeek(ctrl: HomeCtrl, seek: CorrespondenceSeek) {
  console.log(seek)
  const action = seek.username.toLowerCase() === session.getUserId() ?
    'cancelCorresSeek' :
    'joinCorresSeek'

  const icon = seek.color === '' ? 'random' :
      seek.color === 'white' ? 'white' : 'black'

  return h('tr', {
    key: 'seek' + seek.id,
    'id': seek.id,
    className: 'corres_seek ' + action,
    oncreate: helper.ontapY(() => ctrl[action](seek.id))
  }, [
    h('td', h('span.color-icon.' + icon)),
    h('td', seek.username),
    h('td', seek.rating + (seek.provisional ? '?' : '')),
    h('td', seek.days ? i18n(seek.days === 1 ? 'oneDay' : 'nbDays', seek.days) : '∞'),
    h('td', [h(`span[data-icon=${seek.perf.icon}]`), i18n(seek.mode === 1 ? 'rated' : 'casual')]),
  ])
}

function renderFeaturedTournaments(ctrl: HomeCtrl) {
  if (ctrl.featuredTournaments && ctrl.featuredTournaments.length)
    return (
      <div className="homeTournament">
        {renderTournamentList(ctrl.featuredTournaments)}
      </div>
    )
  else
    return null
}

function renderDailyPuzzle(ctrl: HomeCtrl) {
  const puzzle = ctrl.dailyPuzzle
  const boardConf = puzzle ? {
    fen: puzzle.fen,
    orientation: puzzle.color,
    link: () => router.set(`/training/${puzzle.id}?initFen=${puzzle.fen}&initColor=${puzzle.color}`),
  } : {
    orientation: 'white' as Color,
    fen: emptyFen
  }

  return (
    <section className="miniPuzzle" key={puzzle ? puzzle.id : 'empty'}>
      <h2 className="homeTitle">{i18n('puzzleOfTheDay')}</h2>
      {h(MiniBoard, boardConf)}
    </section>
  )
}

function renderTimeline(ctrl: HomeCtrl) {
  const timeline = ctrl.timeline
  if (!timeline || timeline.length === 0) return null

  return (
    <section id="timeline">
      <h2 className="homeTitle">{i18n('timeline')}</h2>
      <ul className="items_list_block"
        oncreate={helper.ontapY(timelineOnTap, undefined, helper.getLI)}
      >
        { timeline.map(renderTimelineEntry)}
      </ul>
      <div className="moreButton">
        <button oncreate={helper.ontapY(() => router.set('/timeline'))}>
          {i18n('more')}
        </button>
      </div>
    </section>
  )
}

function renderPlayban(endsAt: Date) {
  const seconds = (endsAt.valueOf() - Date.now()) / 1000
  return (
    <div className="home-playbanInfo">
      <h2>Sorry :(</h2>
      <p>We had to time you out for a {seconds < 3600 ? 'little ' : ''}while.</p>
      <br />
      <p>The timeout expires <strong>{window.moment(endsAt).fromNow()}</strong>.</p>
      <h2>Why?</h2>
      <p>
        We aim to provide a pleasant chess experience for everyone.
        To that effect, we must ensure that all players follow good practices.
        When a potential problem is detected, we display this message.
      </p>
      <h2>How to avoid this?</h2>
      <ul>
        <li>Play every game you start</li>
        <li>Try to win (or at least draw) every game you play</li>
        <li>Resign lost games (don't let the clock run down)</li>
      </ul>
      <br />
      <br />
      <p>
        We apologize for the temporary inconvenience,<br />
        and wish you great games on lichess.org.<br />
        Thank you for reading!
      </p>
    </div>
  )
}
