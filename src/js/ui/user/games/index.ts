import * as stream from 'mithril/stream';
import { handleXhrError } from '../../../utils';
import * as helper from '../../helper';
import * as xhr from '../userXhr';
import * as IScroll from 'iscroll/build/iscroll-probe';
import spinner from '../../../spinner';
import redraw from '../../../utils/redraw';
import { throttle } from 'lodash';
import socket from '../../../socket';
import layout from '../../layout';
import { header as headerWidget, backButton } from '../../shared/common';
import { renderBody } from './gamesView';
import { GameFilter, UserFullProfile, UserGame } from '../../../lichess/interfaces/user';

interface Attrs {
  id: string
  filter: GameFilter
}

export interface State {
  availableFilters: Mithril.Stream<Array<AvailableFilter>>
  currentFilter: Mithril.Stream<GameFilter>
  isLoadingNextPage: Mithril.Stream<boolean>
  games: Mithril.Stream<Array<UserGame>>
  scrollerOnCreate(vn: Mithril.ChildNode): void
  scrollerOnRemove(vn: Mithril.ChildNode): void
  scrollerOnUpdate(vn: Mithril.ChildNode): void
  userId: string
  user: Mithril.Stream<UserFullProfile | undefined>
  onFilterChange(e: Event): void
  toggleBookmark(i: number): void
}

interface AvailableFilter {
  key: GameFilter
  label: string
  count: number
}

let scroller: IScroll = null;

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

const UserGames: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewSlideIn,

  oninit(vnode) {
    const userId = vnode.attrs.id;
    const user = stream(undefined);
    const availableFilters = stream([]);
    const currentFilter = stream(vnode.attrs.filter || <GameFilter>'all');
    const games = stream([]);
    const paginator = stream(null);
    const isLoadingNextPage = stream(false);

    helper.analyticsTrackView('User games list');

    socket.createDefault();

    spinner.spin();
    Promise.all([
      xhr.games(userId, currentFilter(), 1, false).then(formatDates),
      xhr.user(userId, false)
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

    function loadUserAndFilters(userData: UserFullProfile) {
      user(userData);
      const f = Object.keys(userData.count)
      .filter(k => filters.hasOwnProperty(k) && userData.count[k] > 0)
      .map(k => {
        return {
          key: <GameFilter>k,
          label: filters[k],
          count: user().count[k]
        };
      });
      availableFilters(f);
    }

    function formatDates(xhrData: xhr.FilterResult) {
      if (xhrData.paginator && xhrData.paginator.currentPageResults) {
        xhrData.paginator.currentPageResults.forEach(g => {
          g.date = window.moment(g.timestamp).calendar();
        });
      }
      return xhrData;
    }

    function onScroll() {
      if (this.y + this.distY <= this.maxScrollY) {
        // lichess doesn't allow for more than 39 pages
        if (!isLoadingNextPage() && paginator().nextPage && paginator().nextPage < 40) {
          loadNextPage(paginator().nextPage);
        }
      }
    }

    function scrollerOnCreate(vn: Mithril.ChildNode) {
      const el = <HTMLElement>vn.dom;
      scroller = new IScroll(el, {
        probeType: 2
      });
      scroller.on('scroll', throttle(onScroll, 150));
    }

    function scrollerOnRemove() {
      if (scroller) {
        scroller.destroy();
        scroller = null;
      }
    }

    function scrollerOnUpdate() {
      scroller.refresh();
    }

    function loadInitialGames(data: xhr.FilterResult) {
      paginator(data.paginator);
      games(data.paginator.currentPageResults);
      setTimeout(() => {
        if (scroller) scroller.scrollTo(0, 0, 0);
      }, 50);
      redraw();
    }

    function loadNextPage(page: number) {
      isLoadingNextPage(true);
      xhr.games(userId, currentFilter(), page)
      .then(formatDates)
      .then(data => {
        isLoadingNextPage(false);
        paginator(data.paginator);
        games(games().concat(data.paginator.currentPageResults));
        redraw();
      });
      redraw();
    }

    function onFilterChange(e: Event) {
      currentFilter((e.target as any).value);
      xhr.games(userId, currentFilter(), 1, true)
      .then(formatDates)
      .then(loadInitialGames);
    }

    function toggleBookmark(index: number) {
      games()[index].bookmarked = !games()[index].bookmarked;
      redraw();
    }

    vnode.state = {
      availableFilters,
      currentFilter,
      isLoadingNextPage,
      games,
      scrollerOnCreate,
      scrollerOnRemove,
      scrollerOnUpdate,
      userId,
      user,
      onFilterChange,
      toggleBookmark
    };
  },

  view(vnode) {
    const username = vnode.attrs.id;

    const header = () => headerWidget(null, backButton(username + ' games'));

    return layout.free(header, () => renderBody(this));
  }

}

export default UserGames
