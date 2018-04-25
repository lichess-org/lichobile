import * as h from 'mithril/hyperscript'
import router from '../../router'
import { emptyFen } from '../../utils/fen'
import { hasNetwork } from '../../utils'
import i18n from '../../i18n'
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
        <div className="homeCreate">
          <h2 className="homeTitle">Quick Game</h2>
          {renderQuickSetup(() => newGameForm.openRealTime('custom'))}
        </div>
        {renderFeaturedTournaments(ctrl.featuredTournaments())}
        {renderDailyPuzzle(ctrl)}
        {renderTimeline(ctrl)}
      </div>
    </div>
  )
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
