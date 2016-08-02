import * as xhr from '../userXhr';
import router from '../../../router';
import redraw from '../../../utils/redraw';
import IScroll from 'iscroll/build/iscroll-probe';
import throttle from 'lodash/throttle';
import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import m from 'mithril';

var scroller;

const filters = {
  all: 'gamesPlayed',
  rated: 'rated',
  win: 'wins',
  loss: 'nbLosses',
  draw: 'nbDraws',
  bookmark: 'nbBookmarks',
  me: 'nbGamesWithYou'
};

export default function oninit(vnode) {
  const userId = vnode.attrs.id;
  const user = m.prop();
  const availableFilters = m.prop([]);
  const currentFilter = m.prop(vnode.attrs.filter || 'all');
  const games = m.prop([]);
  const paginator = m.prop(null);
  const isLoadingNextPage = m.prop(false);

  socket.createDefault();

  xhr.user(userId)
  .run(data => {
    user(data);
    let f = Object.keys(data.count)
      .filter(k => filters.hasOwnProperty(k) && data.count[k] > 0)
      .map(k => {
        return {
          key: k,
          label: filters[k],
          count: user().count[k]
        };
      });
    availableFilters(f);
  })
  .catch(error => {
    handleXhrError(error);
    router.set('/');
    throw error;
  });

  function onScroll() {
    if (this.y + this.distY <= this.maxScrollY) {
      // lichess doesn't allow for more than 39 pages
      if (!isLoadingNextPage() && paginator().nextPage && paginator().nextPage < 40) {
        loadNextPage(paginator().nextPage);
      }
    }
  }

  function scrollerOnCreate(vn) {
    const el = vn.dom;
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

  function loadInitialGames() {
    xhr.games(userId, currentFilter(), 1, true)
    .run(data => {
      paginator(data.paginator);
      games(data.paginator.currentPageResults);
      setTimeout(() => {
        if (scroller) scroller.scrollTo(0, 0, 0);
      }, 50);
    })
    .catch(err => {
      handleXhrError(err);
      router.set('/');
    });
  }

  function loadNextPage(page) {
    isLoadingNextPage(true);
    xhr.games(userId, currentFilter(), page)
    .run(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      games(games().concat(data.paginator.currentPageResults));
      redraw();
    })
    .catch(handleXhrError);
    redraw();
  }

  function onFilterChange(e) {
    currentFilter(e.target.value);
    loadInitialGames();
  }

  function toggleBookmark(index) {
    games()[index].bookmarked = !games()[index].bookmarked;
  }

  loadInitialGames();

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
}
