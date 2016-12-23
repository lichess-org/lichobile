import * as stream from 'mithril/stream';
import { handleXhrError } from '../../../utils';
import * as helper from '../../helper';
import * as xhr from '../userXhr';
import spinner from '../../../spinner';
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
  onGamesLoaded(vn: Mithril.ChildNode): void
  onFilterChange(e: Event): void
  toggleBookmark(i: number): void
}

interface ScrollState {
  paginator: Paginator<xhr.UserGameWithDate>
  games: Array<xhr.UserGameWithDate>
  currentFilter: string
  scrollPos: number
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

    const cacheAvailable = cachedScrollState &&
      window.history.state.scrollStateId === cachedScrollState.userId

    if (cacheAvailable) {
      this.scrollState = cachedScrollState
    } else {
      this.scrollState = {
        userId: vnode.attrs.id,
        user: undefined,
        availableFilters: [],
        currentFilter: vnode.attrs.filter || <GameFilter>'all',
        games: [],
        paginator: undefined,
        isLoadingNextPage: false,
        scrollPos: 0
      }

      spinner.spin();
      Promise.all([
        xhr.games(this.scrollState.userId, this.scrollState.currentFilter, 1, false).then(formatDates),
        xhr.user(this.scrollState.userId, false)
      ])
      .then(results => {
        spinner.stop();
        const [gamesData, userData] = results;
        loadInitialGames(gamesData);
        loadUserAndFilters(userData);
      })
      .catch(err => {
        spinner.stop();
        handleXhrError(err);
      });

    }

    try {
      const newState = Object.assign({}, window.history.state, { scrollStateId: this.scrollState.userId })
      window.history.replaceState(newState, null);
    } catch (e) { console.error(e) }

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

    const loadNextPage = (page: number) => {
      this.scrollState.isLoadingNextPage = true
      xhr.games(this.scrollState.userId, this.scrollState.currentFilter, page)
      .then(formatDates)
      .then(data => {
        this.scrollState.paginator = data.paginator
        this.scrollState.isLoadingNextPage = false
        this.scrollState.games = this.scrollState.games.concat(data.paginator.currentPageResults)
        saveScrollState();
        redraw();
      });
      redraw();
    }

    this.onGamesLoaded = ({ dom }: Mithril.ChildNode) => {
      if (cacheAvailable) {
        (dom.parentNode as HTMLElement).scrollTop = cachedScrollState.scrollPos
      }
    }

    this.onScroll = (e: Event) => {
      const target = (e.target as any)
      const content = target.firstChild
      this.scrollState.scrollPos = target.scrollTop
      const nextPage = this.scrollState.paginator.nextPage
      if ((this.scrollState.scrollPos + target.offsetHeight + 50) > content.offsetHeight) {
        // lichess doesn't allow for more than 39 pages
        if (!this.scrollState.isLoadingNextPage && nextPage && nextPage < 40) {
          loadNextPage(nextPage);
        }
      }
      saveScrollState()
    }

    this.onFilterChange = (e: Event) => {
      this.scrollState.currentFilter = (e.target as any).value
      xhr.games(this.scrollState.userId, this.scrollState.currentFilter, 1, true)
      .then(formatDates)
      .then(loadInitialGames);
    }

    this.toggleBookmark = (index: number) => {
      this.scrollState.games[index].bookmarked = !this.scrollState.games[index].bookmarked;
      redraw();
    }
  },

  view(vnode) {
    const username = vnode.attrs.id;

    const header = () => headerWidget(null, backButton(username + ' games'));

    return layout.free(header, () => renderBody(this));
  }
}

function formatDates(xhrData: xhr.FilterResult) {
  if (xhrData.paginator && xhrData.paginator.currentPageResults) {
    xhrData.paginator.currentPageResults.forEach(g => {
      g.date = window.moment(g.timestamp).calendar();
    });
  }
  return xhrData;
}

export default UserGames
