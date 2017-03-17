import * as debounce from 'lodash/debounce'

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
}

export interface SearchState {
  paginator: Paginator<UserGameWithDate> | undefined
  games: Array<UserGameWithDate>
  scrollPos: number
  queryString: string
}

let cachedSearchState: SearchState

export default function SearchCtrl(initQuery: Partial<SearchQuery>): ISearchCtrl {

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

  const searchState: SearchState = {
    paginator: undefined,
    games: [],
    scrollPos: 0,
    queryString: serializeQueryParameters(query)
  }

  const boardTheme = settings.general.theme.board()

  const saveSearchState = debounce(() => {
    cachedSearchState = searchState
  }, 200)

  const onScroll = (e: Event) => {
    const target = (e.target as HTMLElement)
    searchState.scrollPos = target.scrollTop
    saveSearchState()
  }

  function search() {
    xhr.search(query)
    .then(prepareData)
    .then(data => {
      updateHref()
      searchState.paginator = data.paginator
      if (data.paginator) {
        searchState.games = data.paginator.currentPageResults
      }
      redraw()
    })
    .catch(handleXhrError)
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
      }
    )
  }

  const updateHref = debounce(() => {
    const path = `/search?${serializeQueryParameters(query)}`
    try {
      window.history.replaceState(window.history.state, '', '?=' + path)
    } catch (e) { console.error(e) }
  }, 100)

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
        saveSearchState()
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

  if (Object.keys(initQuery).length > 0) search()

  return {
    searchState,
    query,
    search,
    toggleBookmark,
    more,
    boardTheme,
    handleChange,
    toggleAnalysis,
    onScroll
  }
}

function prepareData(xhrData: SearchResult) {
  if (xhrData.paginator && xhrData.paginator.currentPageResults) {
    xhrData.paginator.currentPageResults.forEach(g => {
      g.date = window.moment(g.timestamp).calendar()
    })
  }
  return xhrData
}
