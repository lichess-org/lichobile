import h from 'mithril/hyperscript'
import router from '../../router'
import socket from '../../socket'
import { openExternalBrowser } from '../../utils/browse'
import { emptyFen } from '../../utils/fen'
import { gameIcon, hasNetwork } from '../../utils'
import i18n, { plural, formatNumber, distanceToNowStrict } from '../../i18n'
import session from '../../session'
import settings from '../../settings'
import { PongMessage, CorrespondenceSeek } from '../../lichess/interfaces'
import spinner from '../../spinner'
import * as helper from '../helper'
import { renderTimelineEntry, timelineOnTap } from '../timeline'
import signals from '../../signals'
import MiniBoard from '../shared/miniBoard'
import TabNavigation from '../shared/TabNavigation'
import TabView from '../shared/TabView'
import newGameForm, { renderQuickSetup } from '../newGameForm'
import challengeForm from '../challengeForm'
import playMachineForm from '../playMachineForm'
import { renderTournamentList } from '../tournament/tournamentsListView'

import HomeCtrl from './HomeCtrl'

export function body(ctrl: HomeCtrl) {
  if (hasNetwork()) return online(ctrl)
  else return offline(ctrl)
}

function offline(ctrl: HomeCtrl) {
  const puzzleData = ctrl.offlinePuzzle
  const boardConf = puzzleData ? {
    fixed: true,
    fen: puzzleData.puzzle.fen,
    orientation: puzzleData.puzzle.color,
    link: () => router.set('/training'),
  } : null

  return (
    <div className={'homeOfflineWrapper' + (boardConf ? ' withBoard' : '')}>
      <div className="home homeOffline">
        <section className="playOffline">
          <h2>{i18n('playOffline')}</h2>
          <button className="fatButton" oncreate={helper.ontapY(() => router.set('/ai'))}>{i18n('computer')}</button>
          <button className="fatButton" oncreate={helper.ontapY(() => router.set('/otb'))}>{i18n('overTheBoard')}</button>
        </section>
        { boardConf ?
        <section className="home__miniPuzzle">
          <h2 className="homeTitle">{i18n('puzzles')}</h2>
          {h(MiniBoard, boardConf)}
        </section> : undefined
        }
      </div>
    </div>
  )
}

function online(ctrl: HomeCtrl) {
  const playban = session.get()?.playban
  const playbanEndsAt = playban && new Date(playban.date + playban.mins * 60000)

  return (
    <div className="home">
      {playbanEndsAt && ((playbanEndsAt.valueOf() - Date.now()) / 1000) > 1 ?
        renderPlayban(playbanEndsAt) : renderLobby(ctrl)
      }
      {renderStart(ctrl)}
      <div className="home__side">
        {renderFeaturedStreamers(ctrl)}
        {renderFeaturedTournaments(ctrl)}
        {renderTimeline(ctrl)}
      </div>
      {renderFeaturedGame(ctrl)}
      {renderDailyPuzzle(ctrl)}
    </div>
  )
}

function renderStart(ctrl: HomeCtrl) {
  return (
    <div className="home__start">
      <div className="home__buttons">
        <button className="buttonMetal"
          oncreate={helper.ontapY(() => newGameForm.openRealTime('custom'))}
        >
          {i18n('createAGame')}
        </button>
        <button className="buttonMetal"
          oncreate={helper.ontapY(() => challengeForm.open())}
        >
          {i18n('playWithAFriend')}
        </button>
        <button className="buttonMetal"
          oncreate={helper.ontapY(playMachineForm.open)}
        >
          {i18n('playWithTheMachine')}
        </button>
      </div>
      {h(Stats, { ctrl })}
    </div>
  )
}

const Stats = {
  oncreate({ attrs }) {
    const nbRoundSpread = spreadNumber(
      attrs.ctrl,
      '#nb_games_in_play > strong',
      8,
      socket.getCurrentPingInterval
    )
    const nbUserSpread = spreadNumber(
      attrs.ctrl,
      '#nb_connected_players > strong',
      10,
      socket.getCurrentPingInterval
    )
    this.render = (pong: PongMessage) => {
      nbUserSpread(pong.d)
      setTimeout(() => {
        nbRoundSpread(pong.r)
      }, socket.getCurrentPingInterval() / 2)
    }
    signals.homePong.add(this.render)
  },
  onremove() {
    signals.homePong.remove(this.render)
  },
  view() {
    return h('div.home__stats', [
      h('div#nb_connected_players', h.trust(i18n('nbPlayers:other', '<strong>?</strong>'))),
      h('div#nb_games_in_play', h.trust(i18n('nbGames:other', '<strong>?</strong>'))),
    ])
  }
} as Mithril.Component<{ ctrl: HomeCtrl }, { render: (p: PongMessage) => void }>

function spreadNumber(
  ctrl: HomeCtrl,
  selector: string,
  nbSteps: number,
  getDuration: () => number
): (nb: number, ons?: number) => void {
  let previous: number
  let displayed: string
  function display(el: HTMLElement | null, prev: number, cur: number, it: number) {
    const val = formatNumber(Math.round(((prev * (nbSteps - 1 - it)) + (cur * (it + 1))) / nbSteps))
    if (el && val !== displayed) {
      if (!ctrl.isScrolling) {
        el.textContent = val
        displayed = val
      }
    }
  }
  let timeouts: Array<number> = []
  return function(nb: number, overrideNbSteps?: number) {
    const el = document.querySelector(selector) as HTMLElement
    if (!el || (!nb && nb !== 0)) return
    if (overrideNbSteps) nbSteps = Math.abs(overrideNbSteps)
    timeouts.forEach(clearTimeout)
    timeouts = []
    const prev = previous === 0 ? 0 : (previous || nb)
    previous = nb
    const interv = Math.abs(getDuration() / nbSteps)
    for (let i = 0; i < nbSteps; i++) {
      timeouts.push(
        setTimeout(() => display(el, prev, nb, i), Math.round(i * interv))
      )
    }
  }
}

function renderLobby(ctrl: HomeCtrl) {
  const tabsContent = [
    { id: 'quick', f: () => renderQuickSetup(() => newGameForm.openRealTime('custom')) },
    { id: 'corres', f: () => renderCorresPool(ctrl) },
  ]

  return h('div.home__lobby', [
    h(TabNavigation, {
      buttons: [
        {
          label: i18n('quickPairing')
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
      tabs: tabsContent,
      onTabChange: ctrl.onTabChange,
      className: 'home__setupTabView',
    }),
  ])
}

function renderCorresPool(ctrl: HomeCtrl) {
  return h('div.corresPoolWrapper.native_scroller', [
    h('table.corres_seeks', [
      h('thead', [
        h('tr', [
          h('th', ''),
          h('th', i18n('player')),
          h('th', i18n('rating')),
          h('th', i18n('time')),
          h('th', i18n('mode')),
        ]),
      ]),
      h('tbody', ctrl.corresPool.map(s => renderSeek(ctrl, s)))
    ]),
    h('div.corres_create', [
      h('button.defaultButton', {
        oncreate: helper.ontap(newGameForm.openCorrespondence)
      }, i18n('createAGame')),
    ]),
  ])
}

function renderSeek(ctrl: HomeCtrl, seek: CorrespondenceSeek) {
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
    h('td', seek.days ? plural('nbDays', seek.days) : '∞'),
    h('td', h('span.withIcon', {
      'data-icon': gameIcon(seek.perf.key)
    }, i18n(seek.mode === 1 ? 'rated' : 'casual'))),
  ])
}

function renderFeaturedTournaments(ctrl: HomeCtrl) {
  if (ctrl.featuredTournaments?.length)
    return (
      <div className="home__tournament">
        {renderTournamentList(ctrl.featuredTournaments)}
      </div>
    )
  else
    return null
}

function renderFeaturedStreamers(ctrl: HomeCtrl) {
  if (ctrl.featuredStreamers?.length)
    return h('ul.home__streamers', ctrl.featuredStreamers.map(s =>
      h('li.home__streamer', {
        oncreate: helper.ontapY(() => openExternalBrowser(s.url)),
      }, [
        h('strong[data-icon=]', (s.user.title ? s.user.title + ' ' : '') + s.user.name),
        h('span.status', ' ' + s.status),
      ])
    ))
  else
    return null
}

function renderFeaturedGame(ctrl: HomeCtrl) {
  const featured = ctrl.featuredGame
  const boardConf = featured ? {
    fixed: false,
    fen: featured.fen,
    orientation: featured.orientation,
    lastMove: featured.lastMove,
    link: () => {
      settings.tv.channel('best')
      router.set('/tv')
    },
    gameObj: featured,
  } : {
    fixed: false,
    orientation: 'white' as Color,
    fen: emptyFen,
  }

  return (
    <section className="home__featured">
      {h(MiniBoard, boardConf)}
    </section>
  )
}

function renderDailyPuzzle(ctrl: HomeCtrl) {
  const daily = ctrl.dailyPuzzle
  const boardConf = daily && daily.puzzle && daily.game && daily.game.treeParts ? {
    fixed: true,
    fen: daily.game.treeParts.fen,
    lastMove: daily.game.treeParts.uci,
    orientation: daily.puzzle.color,
    link: () => router.set(`/training/${daily.puzzle.id}?initFen=${daily.puzzle.fen}&initColor=${daily.puzzle.color}`),
    topText: i18n('puzzleOfTheDay'),
    bottomText: daily.puzzle.color === 'white' ? i18n('whitePlays') : i18n('blackPlays'),
  } : {
    fixed: true,
    orientation: 'white' as Color,
    fen: emptyFen,
  }

  return (
    <section className="home__miniPuzzle">
      {h(MiniBoard, boardConf)}
    </section>
  )
}

function renderTimeline(ctrl: HomeCtrl) {
  const timelineData = ctrl.timelineData

  if (timelineData === undefined) {
    return (
      <section className="home__timeline loading">
        {spinner.getVdom('monochrome')}
      </section>
    )
  }

  if (timelineData.entries.length === 0) {
    return (
      <section className="home__timeline">
      </section>
    )
  }

  return (
    <section className="home__timeline">
      <ul
        oncreate={helper.ontapY(timelineOnTap, undefined, helper.getLI)}
      >
        { timelineData.entries.map(entry => renderTimelineEntry(entry, timelineData.users))}
      </ul>
      <div className="more">
        <button oncreate={helper.ontapY(() => router.set('/timeline'))}>
          {i18n('more')} »
        </button>
      </div>
    </section>
  )
}

function renderPlayban(endsAt: Date) {
  return (
    <div className="home-playbanInfo">
      <h2>{i18n('sorry')}</h2>
      <p>{i18n('weHadToTimeYouOutForAWhile')}</p>
      <br />
      <p>{h.trust(i18n('timeoutExpires', `<strong>${distanceToNowStrict(endsAt)}</strong>`))}</p>
      <h2>{i18n('why')}</h2>
      <p>
        {i18n('pleasantChessExperience')}<br />
        {i18n('goodPractice')}<br />
        {i18n('potentialProblem')}
      </p>
      <h2>{i18n('howToAvoidThis')}</h2>
      <ul>
        <li>{i18n('playEveryGame')}</li>
        <li>{i18n('tryToWin')}</li>
        <li>{i18n('resignLostGames')}</li>
      </ul>
      <br />
      <p>
        {i18n('temporaryInconvenience')}<br />
        {i18n('wishYouGreatGames')}<br />
        {i18n('thankYouForReading')}
      </p>
    </div>
  )
}

