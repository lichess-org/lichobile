import * as h from 'mithril/hyperscript'
import router from '../../router'
import { emptyFen } from '../../utils/fen'
import { hasNetwork } from '../../utils'
import i18n from '../../i18n'
import session from '../../session'
import * as helper from '../helper'
import { renderTimelineEntry, timelineOnTap } from '../timeline'
import MiniBoard from '../shared/miniBoard'
import { renderQuickSetup } from '../newGameForm'
import newGameForm from '../newGameForm'
import { TournamentListItem } from '../../lichess/interfaces/tournament'
import { renderTournamentList } from '../tournament/tournamentsListView'

import { Ctrl } from '.'

export function body(ctrl: Ctrl) {
  const nbPlayers = i18n('nbConnectedPlayers', ctrl.nbConnectedPlayers() || '?')
  const nbGames = i18n('nbGamesInPlay', ctrl.nbGamesInPlay() || '?')

  const playbanEndsAt = session.currentBan()

  if (!hasNetwork()) {
    const puzzleData = ctrl.offlinePuzzle()
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
        <div className="stats">
          <div className="numPlayers">{nbPlayers}</div>
          <div className="numGames">{nbGames}</div>
        </div>
        {playbanEndsAt && ((playbanEndsAt.valueOf() - Date.now()) / 1000) > 1 ?
          renderPlayban(playbanEndsAt) : renderQuickGame()
        }
        {renderFeaturedTournaments(ctrl.featuredTournaments())}
        {renderDailyPuzzle(ctrl)}
        {renderTimeline(ctrl)}
      </div>
    </div>
  )
}

function renderQuickGame() {
  return h('div.homeCreate', [
    h('h2.homeTitle', 'Quick Game'),
    renderQuickSetup(() => newGameForm.openRealTime('custom')),
  ])
}

function renderFeaturedTournaments(tournaments: TournamentListItem[]) {
  if (tournaments.length)
    return (
      <div className="homeTournament">
        <h2 className="homeTitle">Featured Tournaments</h2>
        {renderTournamentList(tournaments)}
      </div>
    )
  else
    return null
}

function renderDailyPuzzle(ctrl: Ctrl) {
  const puzzle = ctrl.dailyPuzzle()
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

function renderTimeline(ctrl: Ctrl) {
  const timeline = ctrl.timeline()
  if (timeline.length === 0) return null

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
        We aim to provide a pleasant chess experience for everyone.<br />
        To that effect, we must ensure that all players follow good practices.<br />
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
