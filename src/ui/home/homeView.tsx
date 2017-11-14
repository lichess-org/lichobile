import * as h from 'mithril/hyperscript'
import router from '../../router'
import { emptyFen } from '../../utils/fen'
import { hasNetwork } from '../../utils'
import i18n from '../../i18n'
import * as helper from '../helper'
import { renderTourJoin, renderGameEnd, renderFollow } from '../timeline'
import MiniBoard from '../shared/miniBoard'
import { HomeState } from './interfaces'
import { renderQuickSetup } from '../newGameForm'
import newGameForm from '../newGameForm'
import { Tournament } from '../../lichess/interfaces/tournament'

export function body(ctrl: HomeState) {
  const isPortrait = helper.isPortrait()
  const nbPlayers = i18n('nbConnectedPlayers', ctrl.nbConnectedPlayers() || '?')
  const nbGames = i18n('nbGamesInPlay', ctrl.nbGamesInPlay() || '?')

  if (!hasNetwork()) {
    return (
      <div className="page homeOffline">
        <section id="homeCreate">
          <h2>{i18n('playOffline')}</h2>
          <button className="fatButton" oncreate={helper.ontapY(() => router.set('/ai'))}>{i18n('playOfflineComputer')}</button>
          <button className="fatButton" oncreate={helper.ontapY(() => router.set('/otb'))}>{i18n('playOnTheBoardOffline')}</button>
        </section>
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
          <h2 className="homeTitle">Quick game</h2>
          {renderQuickSetup(() => newGameForm.openRealTime('custom'))}
        </div>
        {renderFeaturedTournaments(ctrl.featuredTournaments())}
        {renderDailyPuzzle(ctrl, isPortrait)}
        {renderTimeline(ctrl)}
      </div>
    </div>
  )
}

function renderTournament(t: Tournament) {
  return(
    <div className="featuredTournament">
      {t.fullName}
    </div>
    )
}

function renderFeaturedTournaments(tournaments: Tournament[]) {
  return tournaments ? h('div.featuredTournaments', { key: 'featuredTournaments' },
    tournaments.map(t => renderTournament(t)))
  : null
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

function renderDailyPuzzle(ctrl: HomeState, isPortrait: boolean) {
  const puzzle = ctrl.dailyPuzzle()
  const boardConf = puzzle ? {
    bounds: miniBoardSize(isPortrait),
    fen: puzzle.fen,
    orientation: puzzle.color,
    link: () => router.set(`/training/${puzzle.id}?initFen=${puzzle.fen}&initColor=${puzzle.color}`),
  } : {
    bounds: miniBoardSize(isPortrait),
    orientation: 'white' as Color,
    fen: emptyFen
  }

  return (
    <section id="dailyPuzzle" key={puzzle ? puzzle.id : 'empty'}>
      <h2 className="homeTitle">{i18n('puzzleOfTheDay')}</h2>
      {h(MiniBoard, boardConf)}
    </section>
  )
}

function renderTimeline(ctrl: HomeState) {
  const timeline = ctrl.timeline()
  if (timeline.length === 0) return null

  return (
    <section id="timeline">
      <h2 className="homeTitle">{i18n('timeline')}</h2>
      <ul className="items_list_block">
        { timeline.map((e: any) => {
          if (e.type === 'follow') {
            return renderFollow(e)
          } else if (e.type === 'game-end') {
            return renderGameEnd(e)
          } else if (e.type === 'tour-join') {
            return renderTourJoin(e)
          }
          return null
        })}
      </ul>
      <div className="moreButton">
        <button oncreate={helper.ontapY(() => router.set('/timeline'))}>
          {i18n('more')}
        </button>
      </div>
    </section>
  )
}
