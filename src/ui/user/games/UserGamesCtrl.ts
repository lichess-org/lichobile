import debounce from 'lodash-es/debounce'
import { handleXhrError } from '../../../utils'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import { positionsCache } from '../../../utils/gamePosition'
import settings from '../../../settings'
import { fromNow } from '../../../i18n'
import router from '../../../router'
import session from '../../../session'
import * as xhr from '../userXhr'
import { toggleGameBookmark } from '../../../xhr'
import redraw from '../../../utils/redraw'
import { Paginator } from '../../../lichess/interfaces'
import { GameFilter, UserFullProfile, UserGameWithDate } from '../../../lichess/interfaces/user'

export interface IUserGamesCtrl {
  scrollState: ScrollState
  onScroll(e: Event): void
  onGamesLoaded(vn: Mithril.VnodeDOM<any, any>): void
  onFilterChange(e: Event): void
  toggleBookmark(id: string): void
  boardTheme: string
  goToGame(id: string, playerId?: string): void
}

export interface ScrollState {
  user: UserFullProfile | undefined
  paginator: Paginator<UserGameWithDate> | undefined
  games: Array<UserGameWithDate>
  currentFilter: string
  scrollPos: number
  userId: string
  availableFilters: ReadonlyArray<AvailableFilter>
  isLoadingNextPage: boolean
}

interface AvailableFilter {
  key: GameFilter
  label: string
  count: number
}

const filters: StringMap = {
  all: 'nbGames',
  rated: 'nbRated',
  win: 'nbWins',
  loss: 'nbLosses',
  draw: 'nbDraws',
  bookmark: 'nbBookmarks',
  me: 'nbGamesWithYou',
  import: 'nbImportedGames',
  playing: 'nbPlaying'
}

let cachedScrollState: ScrollState

export default function UserGamesCtrl(userId: string, filter?: string): IUserGamesCtrl {
  // used to restore scroll position only once from cached state
  let initialized = false

  const cacheAvailable = cachedScrollState && userId === cachedScrollState.userId

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
        g.date = fromNow(new Date(g.timestamp))
      })
    }
    return xhrData
  }

  const loadUserAndFilters = (userData: UserFullProfile) => {
    scrollState.user = userData
    const f = Object.keys(userData.count)
    .filter(k => Object.prototype.hasOwnProperty.call(filters, k) && (k === 'all' || userData.count[k] > 0))
    .map(k => {
      return {
        key: <GameFilter>k,
        label: filters[k]!,
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

  const onGamesLoaded = ({ dom }: Mithril.VnodeDOM<any, any>) => {
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

  const goToGame = (id: string, playerId?: string) => {
    const g = scrollState.games.find(game => game.id === id)
    if (g) {
      const whiteUser = g.players.white.user
      const userColor: Color = whiteUser && whiteUser.id === userId ? 'white' : 'black'
      positionsCache.set(g.id, { fen: g.fen, orientation: userColor })
      const mePlaying = session.getUserId() === userId
      if (mePlaying && playerId !== undefined) {
        router.set(`/game/${id}${playerId}?goingBack=1`)
      } else {
        router.set(`/analyse/online/${id}/${userColor}?curFen=${g.fen}&slide=1`)
      }
    }
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
    .then(([gamesData, userData]) => {
      loadUserAndFilters(userData)
      loadInitialGames(gamesData)
    })
    .catch(err => {
      handleXhrError(err)
    })
  }

  return {
    scrollState,
    onScroll,
    onGamesLoaded,
    onFilterChange,
    toggleBookmark,
    boardTheme,
    goToGame,
  }
}
