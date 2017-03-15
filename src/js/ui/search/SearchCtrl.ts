import * as debounce from 'lodash/debounce'

import { SearchResult, SearchQuery, UserGameWithDate } from './interfaces'
import settings from '../../settings'
import * as xhr from './searchXhr'
import * as stream from 'mithril/stream'
import { handleXhrError, serializeQueryParameters } from '../../utils'
import redraw from '../../utils/redraw'
import { toggleGameBookmark as toggleBookmarkXhr} from '../../xhr'

export interface ISearchCtrl {
  query: SearchQuery,
  handleChange: (name: string) => (e: Event) => void
  toggleAnalysis: () => void
  search: () => void
  result: Mithril.Stream<SearchResult>
  toggleBookmark: (id: string) => void
  games: Mithril.Stream<Array<UserGameWithDate>>
  more: () => void
  boardTheme: string
}

export default function SearchCtrl(initQuery: SearchQuery): ISearchCtrl {
  const result = stream<SearchResult>()
  const games = stream<Array<UserGameWithDate>>()

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

  const boardTheme = settings.general.theme.board()

  function search() {
    xhr.search(query)
    .then((data: SearchResult) => {
      updateHref()
      result(prepareData(data))
      const curPaginator = result().paginator
      if (curPaginator) {
        games(curPaginator.currentPageResults)
      }
      redraw()
    })
    .catch(handleXhrError)
  }

  function toggleBookmark(id: string) {
    toggleBookmarkXhr(id).then(() => {
        const i = games().findIndex(h => h.id === id)
        const g = games()[i]
        if (g) {
          const ng = Object.assign({}, g, { bookmarked: !g.bookmarked })
          games()[i] = ng
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
    const curPaginator = result().paginator
    if (curPaginator && curPaginator.nextPage) {
      xhr.search(query)
      .then((data: SearchResult) => {
        result(prepareData(data))
        games(games().concat(curPaginator.currentPageResults))
        redraw()
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
    query,
    search,
    result,
    games,
    toggleBookmark,
    more,
    boardTheme,
    handleChange,
    toggleAnalysis
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
