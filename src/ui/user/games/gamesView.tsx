import * as throttle from 'lodash/throttle'
import * as h from 'mithril/hyperscript'
import * as utils from '../../../utils'
import { positionsCache } from '../../../utils/gamePosition'
import router from '../../../router'
import * as helper from '../../helper'
import i18n from '../../../i18n'
import session from '../../../session'
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
                {utils.capitalize(i18n(f.label).replace('%s ', ''))} ({f.count})
              </option>
            )
          })}
        </select>
        <div className="main_header_drop_shadow" />
      </div>
      {renderAllGames(ctrl)}
    </div>
  )
}

function getButton(e: Event): HTMLElement | undefined {
  const target = (e.target as HTMLElement)
  return target.tagName === 'BUTTON' ? target : undefined
}

interface GameDataSet extends DOMStringMap {
  id: string
}
function onTap(ctrl: IUserGamesCtrl, e: Event) {
  const starButton = getButton(e)
  const el = helper.getLI(e)
  const id = el && (el.dataset as GameDataSet).id
  if (starButton) {
    ctrl.toggleBookmark(id)
  } else {
    if (id) {
      const g = ctrl.scrollState.games.find(game => game.id === id)
      const userId = ctrl.scrollState.userId
      if (g) {
        const userColor: Color = g.players.white.userId === userId ? 'white' : 'black'
        positionsCache.set(g.id, { fen: g.fen, orientation: userColor })
        const mePlaying = session.getUserId() === userId
        if (mePlaying) {
          router.set(`/game/${id}/${userColor}?goingBack=1`)
        } else {
          router.set(`/analyse/online/${id}/${userColor}?curFen=${g.fen}`)
        }
      }
    }
  }
}


function renderAllGames(ctrl: IUserGamesCtrl) {
  const { games  } = ctrl.scrollState
  return (
    <div id="scroller-wrapper" className="scroller native_scroller games"
      oncreate={helper.ontapY(e => onTap(ctrl, e!), undefined, helper.getLI)}
      onscroll={throttle(ctrl.onScroll, 30)}
    >
      { games.length ?
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
        <div className="userGame-loader">
          {spinner.getVdom('monochrome')}
        </div>
      }
    </div>
  )
}
