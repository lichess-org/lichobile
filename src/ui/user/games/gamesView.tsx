import throttle from 'lodash-es/throttle'
import h from 'mithril/hyperscript'
import router from '../../../router'
import * as helper from '../../helper'
import { plural } from '../../../i18n'
import spinner from '../../../spinner'
import GameItem from '../../shared/GameItem'

import { IUserGamesCtrl, } from './UserGamesCtrl'

export function renderBody(ctrl: IUserGamesCtrl) {
  return (
    <div className="userGamesWrapper">
      <div className="select_input select_games_filter">
        <label htmlFor="filterGames"></label>
        <select id="filterGames" onchange={ctrl.onFilterChange}>
          {ctrl.scrollState.availableFilters.map(f => {
            return (
              <option value={f.key} selected={ctrl.scrollState.currentFilter === f.key}>
                {plural(f.label, f.count)}
              </option>
            )
          })}
        </select>
      </div>
      {renderAllGames(ctrl)}
    </div>
  )
}

function getButton(e: Event): HTMLElement | undefined {
  const target = (e.target as HTMLElement)
  return target.tagName === 'BUTTON' ? target : undefined
}

function onTap(ctrl: IUserGamesCtrl, e: Event) {
  const starButton = getButton(e)
  const tournamentLink = helper.findElByClassName(e, 'tournament')
  const el = helper.getLI(e)
  const id = el && el.dataset.id
  const playerId = el && el.dataset.pid
  if (id && starButton) {
    ctrl.toggleBookmark(id)
  } else if (tournamentLink) {
    const tid = tournamentLink.dataset.id
    if (tid) {
      router.set(`/tournament/${tid}`)
    }
  } else {
    if (id) {
      ctrl.goToGame(id, playerId)
    }
  }
}

function renderAllGames(ctrl: IUserGamesCtrl) {
  const { games, paginator } = ctrl.scrollState
  return (
    <div id="scroller-wrapper" className="native_scroller userGame-scroller box"
      oncreate={helper.ontapY(e => onTap(ctrl, e!), undefined, helper.getLI)}
      onscroll={throttle(ctrl.onScroll, 30)}
    >
      { paginator ?
        <ul className="userGames" oncreate={ctrl.onGamesLoaded}>
          { games.map((g, i) =>
              h(GameItem, {
                key: g.id,
                g,
                index: i,
                boardTheme: ctrl.boardTheme,
                userId: ctrl.scrollState.userId
              })
            )
          }
          {ctrl.scrollState.isLoadingNextPage ?
          <li className="list_item loadingNext">loading...</li> : null
          }
        </ul> :
        <div className="loader_container">
          {spinner.getVdom('monochrome')}
        </div>
      }
    </div>
  )
}
