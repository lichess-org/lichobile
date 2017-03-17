import { handleXhrError } from '../../../utils'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import settings from '../../../settings'
import * as xhr from '../userXhr'
import { toggleGameBookmark } from '../../../xhr'
import redraw from '../../../utils/redraw'
import * as debounce from 'lodash/debounce'
import { Paginator } from '../../../lichess/interfaces'
import { GameFilter, UserFullProfile, UserGameWithDate } from '../../../lichess/interfaces/user'

export interface IUserGamesCtrl {
  scrollState: ScrollState
  onScroll(e: Event): void
  onGamesLoaded(vn: Mithril.DOMNode): void
  onFilterChange(e: Event): void
  toggleBookmark(id: string): void
  boardTheme: string
}

export interface ScrollState {
  user: UserFullProfile | undefined
  paginator: Paginator<UserGameWithDate> | undefined
  games: Array<UserGameWithDate>
  currentFilter: string
  scrollPos: number
  userId: string
  availableFilters: Array<AvailableFilter>
  isLoadingNextPage: boolean
}

interface AvailableFilter {
  key: GameFilter
  label: string
  count: number
}

const filters: StringMap = {
  all: 'gamesPlayed',
  rated: 'rated',
  win: 'wins',
  loss: 'nbLosses',
  draw: 'nbDraws',
  bookmark: 'nbBookmarks',
  me: 'nbGamesWithYou',
  import: 'nbImportedGames',
  playing: 'playingRightNow'
}

let cachedScrollState: ScrollState

export default function UserGamesCtrl(userId: string, filter?: string): IUserGamesCtrl {
  let initialized = false

  const scrollStateId = window.history.state.scrollStateId
  const cacheAvailable = cachedScrollState && scrollStateId === cachedScrollState.userId

  const boardTheme = settings.general.theme.board()

  const scrollState: ScrollState = {
    userId,
    user: undefined,
    availableFilters: [],
    currentFilter: filter || <GameFilter>'all',
    games: [],
    paginator: undefined,
    isLoadingNextPage: false,
    scrollPos: 0
  }

  function prepareData(xhrData: xhr.FilterResult) {
    if (xhrData.paginator && xhrData.paginator.currentPageResults) {
      xhrData.paginator.currentPageResults.forEach(g => {
        g.date = window.moment(g.timestamp).calendar()
      })
    }
    return xhrData
  }

  const loadUserAndFilters = (userData: UserFullProfile) => {
    scrollState.user = userData
    const f = Object.keys(userData.count)
    .filter(k => filters.hasOwnProperty(k) && userData.count[k] > 0)
    .map(k => {
      return {
        key: <GameFilter>k,
        label: filters[k],
        count: scrollState.user ? scrollState.user.count[k] : 0
      }
    })
    scrollState.availableFilters = f
  }

  const saveScrollState = debounce(() => {
    cachedScrollState = scrollState
  }, 200)

  const loadInitialGames = (data: xhr.FilterResult) => {
    scrollState.paginator = data.paginator
    scrollState.games = data.paginator.currentPageResults
    setTimeout(() => {
      const scroller = document.getElementById('scroller-wrapper')
      if (scroller) scroller.scrollTop = 0
    }, 50)
    redraw()
  }

  const loadNextPage = (page: number) => {
    scrollState.isLoadingNextPage = true
    xhr.games(scrollState.userId, scrollState.currentFilter, page)
    .then(prepareData)
    .then(data => {
      scrollState.paginator = data.paginator
      scrollState.isLoadingNextPage = false
      scrollState.games = scrollState.games.concat(data.paginator.currentPageResults)
      saveScrollState()
      redraw()
    })
    redraw()
  }

  const onGamesLoaded = ({ dom }: Mithril.DOMNode) => {
    if (cacheAvailable && !initialized) {
      batchRequestAnimationFrame(() => {
        (dom.parentNode as HTMLElement).scrollTop = cachedScrollState.scrollPos
        initialized = true
      })
    }
  }

  const onScroll = (e: Event) => {
    const target = (e.target as HTMLElement)
    const content = target.firstChild as HTMLElement
    const paginator = scrollState.paginator
    const nextPage = paginator && paginator.nextPage
    if ((target.scrollTop + target.offsetHeight + 50) > content.offsetHeight) {
      // lichess doesn't allow for more than 39 pages
      if (!scrollState.isLoadingNextPage && nextPage && nextPage < 40) {
        loadNextPage(nextPage)
      }
    }
    scrollState.scrollPos = target.scrollTop
    saveScrollState()
  }

  const onFilterChange = (e: Event) => {
    scrollState.currentFilter = (e.target as HTMLInputElement).value
    xhr.games(scrollState.userId, scrollState.currentFilter, 1, true)
    .then(prepareData)
    .then(loadInitialGames)
  }

  const toggleBookmark = (id: string) => {
    toggleGameBookmark(id).then(() => {
      const i = scrollState.games.findIndex(g => g.id === id)
      const g = scrollState.games[i]
      if (g) {
        const ng = Object.assign({}, g, { bookmarked: !g.bookmarked })
        scrollState.games[i] = ng
        redraw()
      }
    })
    .catch(handleXhrError)
  }

  // load either from cache (restore previous search) or from server
  if (cacheAvailable) {
    setTimeout(() => {
      Object.assign(scrollState, cachedScrollState)
      redraw()
    }, 300)
  } else {
    Promise.all([
      xhr.games(scrollState.userId, scrollState.currentFilter, 1, false)
      .then(prepareData),
      xhr.user(scrollState.userId, false)
    ])
    .then(results => {
      const [gamesData, userData] = results
      loadUserAndFilters(userData)
      setTimeout(() => loadInitialGames(gamesData), 300)
    })
    .catch(err => {
      handleXhrError(err)
    })
  }

  // assign userId to history state to be able to retrieve cached scroll state
  // later...
  try {
    const newState = Object.assign({}, window.history.state, { scrollStateId: scrollState.userId })
    window.history.replaceState(newState, '')
  } catch (e) { console.error(e) }

  return {
    scrollState,
    onScroll,
    onGamesLoaded,
    onFilterChange,
    toggleBookmark,
    boardTheme
  }
}
