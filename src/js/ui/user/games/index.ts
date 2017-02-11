import { handleXhrError } from '../../../utils';
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import * as helper from '../../helper';
import * as xhr from '../userXhr';
import { toggleGameBookmark } from '../../../xhr';
import redraw from '../../../utils/redraw';
import { debounce } from 'lodash';
import socket from '../../../socket';
import layout from '../../layout';
import { header as headerWidget, backButton } from '../../shared/common';
import { renderBody } from './gamesView';
import { Paginator } from '../../../lichess/interfaces';
import { GameFilter, UserFullProfile } from '../../../lichess/interfaces/user';

interface Attrs {
  id: string
  filter: GameFilter
}

export interface State {
  scrollState: ScrollState
  onScroll(e: Event): void
  onGamesLoaded(vn: Mithril.DOMNode): void
  onFilterChange(e: Event): void
  toggleBookmark(id: string): void
}

export interface ScrollState {
  paginator: Paginator<xhr.UserGameWithDate>
  games: Array<xhr.UserGameWithDate>
  currentFilter: string
  scrollPos: number
  viewport: number
  itemSize: number
  boardBounds: { width: number, height: number }
  user: UserFullProfile
  userId: string
  availableFilters: Array<AvailableFilter>
  isLoadingNextPage: boolean
}

interface AvailableFilter {
  key: GameFilter
  label: string
  count: number
}

const filters = {
  all: 'gamesPlayed',
  rated: 'rated',
  win: 'wins',
  loss: 'nbLosses',
  draw: 'nbDraws',
  bookmark: 'nbBookmarks',
  me: 'nbGamesWithYou',
  import: 'nbImportedGames',
  playing: 'playingRightNow'
};

let cachedScrollState: ScrollState

const UserGames: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewSlideIn,

  oninit(vnode) {
    helper.analyticsTrackView('User games list');
    socket.createDefault();

    let initialized = false

    const scrollStateId = window.history.state.scrollStateId
    const cacheAvailable = cachedScrollState && scrollStateId === cachedScrollState.userId

    const viewport = helper.viewportDim()
    const boardsize = (viewport.vw - 20) * 0.30

    this.scrollState = {
      userId: vnode.attrs.id,
      user: undefined,
      availableFilters: [],
      currentFilter: vnode.attrs.filter || <GameFilter>'all',
      games: [],
      paginator: undefined,
      isLoadingNextPage: false,
      scrollPos: 0,
      viewport: viewport.vh - 85,
      boardBounds: { height: boardsize, width: boardsize },
      itemSize: (viewport.vw - 20) * 0.30 + 20 + 1
    }

    function prepareData(xhrData: xhr.FilterResult) {
      if (xhrData.paginator && xhrData.paginator.currentPageResults) {
        xhrData.paginator.currentPageResults.forEach(g => {
          g.date = window.moment(g.timestamp).calendar();
        });
      }
      return xhrData;
    }

    const loadUserAndFilters = (userData: UserFullProfile) => {
      this.scrollState.user = userData
      const f = Object.keys(userData.count)
      .filter(k => filters.hasOwnProperty(k) && userData.count[k] > 0)
      .map(k => {
        return {
          key: <GameFilter>k,
          label: filters[k],
          count: this.scrollState.user.count[k]
        };
      });
      this.scrollState.availableFilters = f
    }

    const saveScrollState = debounce(() => {
      cachedScrollState = this.scrollState
    }, 200)

    const loadInitialGames = (data: xhr.FilterResult) => {
      this.scrollState.paginator = data.paginator
      this.scrollState.games = data.paginator.currentPageResults
      setTimeout(() => {
        const scroller = document.getElementById('scroller-wrapper')
        if (scroller) scroller.scrollTop = 0
      }, 50);
      redraw();
    }


    if (cacheAvailable) {
      setTimeout(() => {
        this.scrollState = cachedScrollState
        redraw()
      }, 300)
    } else {
      Promise.all([
        xhr.games(this.scrollState.userId, this.scrollState.currentFilter, 1, false)
        .then(prepareData),
        xhr.user(this.scrollState.userId, false)
      ])
      .then(results => {
        const [gamesData, userData] = results;
        loadUserAndFilters(userData);
        setTimeout(() => loadInitialGames(gamesData), 300)
      })
      .catch(err => {
        handleXhrError(err);
      });
    }

    try {
      const newState = Object.assign({}, window.history.state, { scrollStateId: this.scrollState.userId })
      window.history.replaceState(newState, null);
    } catch (e) { console.error(e) }

    const loadNextPage = (page: number) => {
      this.scrollState.isLoadingNextPage = true
      xhr.games(this.scrollState.userId, this.scrollState.currentFilter, page)
      .then(prepareData)
      .then(data => {
        this.scrollState.paginator = data.paginator
        this.scrollState.isLoadingNextPage = false
        this.scrollState.games = this.scrollState.games.concat(data.paginator.currentPageResults)
        saveScrollState();
        redraw();
      });
      redraw();
    }

    this.onGamesLoaded = ({ dom }: Mithril.DOMNode) => {
      if (cacheAvailable && !initialized) {
        batchRequestAnimationFrame(() => {
          (dom.parentNode as HTMLElement).scrollTop = cachedScrollState.scrollPos
          initialized = true
        })
      }
    }

    this.onScroll = (e: Event) => {
      const target = (e.target as HTMLElement)
      const content = target.firstChild as HTMLElement
      const nextPage = this.scrollState.paginator.nextPage
      if ((target.scrollTop + target.offsetHeight + 50) > content.offsetHeight) {
        // lichess doesn't allow for more than 39 pages
        if (!this.scrollState.isLoadingNextPage && nextPage && nextPage < 40) {
          loadNextPage(nextPage);
        }
      }
      this.scrollState.scrollPos = target.scrollTop
      saveScrollState()
    }

    this.onFilterChange = (e: Event) => {
      this.scrollState.currentFilter = (e.target as HTMLInputElement).value
      xhr.games(this.scrollState.userId, this.scrollState.currentFilter, 1, true)
      .then(prepareData)
      .then(loadInitialGames);
    }

    this.toggleBookmark = (id: string) => {
      toggleGameBookmark(id).then(() => {
        const i = this.scrollState.games.findIndex(g => g.id === id)
        const g = this.scrollState.games[i]
        if (g) {
          const ng = Object.assign({}, g, { bookmarked: !g.bookmarked })
          this.scrollState.games[i] = ng
          redraw();
        }
      })
      .catch(handleXhrError);
    }
  },

  view(vnode) {
    const username = vnode.attrs.id;

    const header = () => headerWidget(null, backButton(username + ' games'));

    return layout.free(header, () => renderBody(this));
  }
}


export default UserGames
