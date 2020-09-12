import { fromNow } from '../../i18n'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'
import { Paginator } from '../../lichess/interfaces'
import { UserGameWithDate } from '../../lichess/interfaces/user'
import settings from '../../settings'
import { handleXhrError, serializeQueryParameters } from '../../utils'
import redraw from '../../utils/redraw'
import { toggleGameBookmark as toggleBookmarkXhr} from '../../xhr'

import * as xhr from './searchXhr'
import { SearchResult, SearchQuery } from './interfaces'

export interface ISearchCtrl {
  query: SearchQuery,
  handleChange: (name: string) => (e: Event) => void
  toggleAnalysis: () => void
  search: () => void
  toggleBookmark: (id: string) => void
  more: () => void
  boardTheme: string
  searchState: SearchState
  onScroll(e: Event): void
  onGamesLoaded(vn: Mithril.VnodeDOM<any, any>): void
}

export interface SearchState {
  paginator: Paginator<UserGameWithDate> | undefined
  games: Array<UserGameWithDate>
  scrollPos: number
  queryString: string
  searching: boolean
}

let cachedSearchState: SearchState

export default function SearchCtrl(initQuery: Partial<SearchQuery>): ISearchCtrl {

  // used to restore scroll position only once from cached state
  let initialized = false

  const query: SearchQuery = {
    'players.a': '',
    'players.b': '',
    'players.white': '',
    'players.black': '',
    'players.winner': '',
    ratingMin: '',
    ratingMax: '',
    hasAi: '',
    source: '',
    perf: '',
    turnsMin: '',
    turnsMax: '',
    durationMin: '',
    durationMax: '',
    'clock.initMin': '',
    'clock.initMax': '',
    'clock.incMin': '',
    'clock.incMax': '',
    status: '',
    winnerColor: '',
    dateMin: '',
    dateMax: '',
    'sort.field': 'd',
    'sort.order': 'desc',
    analysed: ''
  }
  Object.assign(query, initQuery)

  const queryString = serializeQueryParameters(query)
  const cacheAvailable = cachedSearchState && queryString === cachedSearchState.queryString

  const searchState: SearchState = {
    paginator: undefined,
    games: [],
    scrollPos: 0,
    queryString,
    searching: false
  }

  const boardTheme = settings.general.theme.board()

  const updateSearchStateCache = () => {
    cachedSearchState = searchState
  }

  const onGamesLoaded = () => {
    if (cacheAvailable && !initialized) {
      batchRequestAnimationFrame(() => {
        const scroller = document.getElementById('searchContent')
        if (scroller) scroller.scrollTop = cachedSearchState.scrollPos
        initialized = true
      })
    }
  }

  const onScroll = (e: Event) => {
    const target = (e.target as HTMLElement)
    searchState.scrollPos = target.scrollTop
    updateSearchStateCache()
  }

  function search() {
    if (!searchState.searching) {
      searchState.searching = true
      redraw()
      // go to the bottom to see spinner and the beginning of search results
      setTimeout(() => {
        const scroller = document.getElementById('searchContent')
        if (scroller) {
          scroller.scrollTop = 99999
        }
      }, 250)

      xhr.search(query)
      .then(prepareData)
      .then(data => {
        searchState.queryString = serializeQueryParameters(query)
        searchState.searching = false
        searchState.paginator = data.paginator
        if (data.paginator) {
          searchState.games = data.paginator.currentPageResults
        } else {
          searchState.games = []
        }
        updateHref()
        updateSearchStateCache()
        // delay display of result to have a little feedback of searching
        // even when it's super fast
        setTimeout(redraw, 500)
      })
      .catch(err => {
        searchState.searching = false
        redraw()
        handleXhrError(err)
      })
    }
  }

  function toggleBookmark(id: string) {
    toggleBookmarkXhr(id).then(() => {
      const i = searchState.games.findIndex(h => h.id === id)
      const g = searchState.games[i]
      if (g) {
        const ng = Object.assign({}, g, { bookmarked: !g.bookmarked })
        searchState.games[i] = ng
        redraw()
      }
    })
  }

  function updateHref() {
    const path = `/search?${searchState.queryString}`
    try {
      window.history.replaceState(window.history.state, '', '?=' + path)
    } catch (e) { console.error(e) }
  }

  function more() {
    const curPaginator = searchState.paginator
    if (curPaginator && curPaginator.nextPage) {
      xhr.search(query, curPaginator.nextPage)
      .then(prepareData)
      .then(data => {
        searchState.paginator = data.paginator
        if (searchState.paginator) {
          searchState.games = searchState.games.concat(searchState.paginator.currentPageResults)
          redraw()
        }
        updateSearchStateCache()
      })
      .catch(handleXhrError)
    }
  }

  const handleChange = (name: string) => (e: Event) => {
    const val = (e.target as HTMLInputElement).value.trim()
    Object.assign(query, { [name]: val })
    redraw()
  }

  const toggleAnalysis = () => {
    query.analysed = query.analysed === '1' ? '' : '1'
    redraw()
  }

  if (cacheAvailable) {
    setTimeout(() => {
      Object.assign(searchState, cachedSearchState)
      redraw()
    }, 300)
  } else if (Object.keys(initQuery).length > 0) {
    search()
  }

  return {
    searchState,
    query,
    search,
    toggleBookmark,
    more,
    boardTheme,
    handleChange,
    toggleAnalysis,
    onScroll,
    onGamesLoaded
  }
}

function prepareData(xhrData: SearchResult) {
  if (xhrData.paginator && xhrData.paginator.currentPageResults) {
    xhrData.paginator.currentPageResults.forEach(g => {
      g.date = fromNow(new Date(g.timestamp))
    })
  }
  return xhrData
}
