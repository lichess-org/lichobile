import { SearchResult, SearchQuery, UserGameWithDate } from './interfaces'
import * as xhr from './searchXhr'
import * as stream from 'mithril/stream'
import { handleXhrError } from '../../utils'
import redraw from '../../utils/redraw'
import { toggleGameBookmark as toggleBookmarkXhr} from '../../xhr'

export interface ISearchCtrl {
  search: (form: HTMLFormElement) => void
  result: Mithril.Stream<SearchResult>
  toggleBookmark: (id: string) => void
  games: Mithril.Stream<Array<UserGameWithDate>>
  more: () => void
  lastQuery: Mithril.Stream<SearchQuery>
  scrollPos: Mithril.Stream<number>
}

export default function SearchCtrl(): ISearchCtrl {
  const result = stream<SearchResult>()
  const games = stream<Array<UserGameWithDate>>()
  const lastQuery = stream<SearchQuery>()
  const scrollPos = stream<number>()

  const fields = ['players.a', 'players.b', 'players.white', 'players.black', 'players.winner', 'ratingMin', 'ratingMax', 'hasAi', 'source', 'perf', 'turnsMin', 'turnsMax', 'durationMin', 'durationMax', 'clock.initMin', 'clock.initMax', 'clock.incMin', 'clock.incMax', 'status', 'winnerColor', 'dateMin', 'dateMax', 'sort.field', 'sort.order', 'analysed']

  function search(form: HTMLFormElement) {
    const elements: HTMLCollection = form.elements as HTMLCollection
    const queryData = fields.reduce((acc, el) => buildQuery(elements, acc, el), {}) as SearchQuery
    lastQuery(queryData)
    xhr.search(queryData)
    .then((data: SearchResult) => {
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

  function more() {
    const queryData = lastQuery()
    const curPaginator = result().paginator
    if (curPaginator && curPaginator.nextPage) {
      queryData.page = String(curPaginator.nextPage)
      xhr.search(queryData)
      .then((data: SearchResult) => {
        result(prepareData(data))
        games(games().concat(curPaginator.currentPageResults))
        redraw()
      })
      .catch(handleXhrError)
    }
  }

  return {
    search,
    result,
    games,
    toggleBookmark,
    more,
    lastQuery,
    scrollPos
  }

}

function buildQuery(elements: HTMLCollection, acc: Partial<SearchQuery>, name: string) {
  // ts don't support string access in HTMLCollection it seems
  if ((<any>elements)[name]) {
    acc[name] = (<any>elements)[name].value
    return acc
  }
  else {
    return acc
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
