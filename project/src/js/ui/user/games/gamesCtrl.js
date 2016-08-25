import * as xhr from '../userXhr';
import helper from '../../helper';
import redraw from '../../../utils/redraw';
import IScroll from 'iscroll/build/iscroll-probe';
import { throttle } from 'lodash/function';
import socket from '../../../socket';
import * as m from 'mithril';
import { handleXhrError } from '../../../utils';

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

  helper.analyticsTrackView('User games list');

  socket.createDefault();

  Promise.all([
    xhr.games(userId, currentFilter(), 1, true),
    xhr.user(userId)
  ])
  .then(results => {
    const [gamesData, userData] = results;
    loadInitialGames(gamesData);
    loadUserAndFilters(userData);
  })
  .catch(handleXhrError);

  function loadUserAndFilters(userData) {
    user(userData);
    let f = Object.keys(userData.count)
    .filter(k => filters.hasOwnProperty(k) && userData.count[k] > 0)
    .map(k => {
      return {
        key: k,
        label: filters[k],
        count: user().count[k]
      };
    });
    availableFilters(f);
  }

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

  function loadInitialGames(data) {
    paginator(data.paginator);
    games(data.paginator.currentPageResults);
    setTimeout(() => {
      if (scroller) scroller.scrollTo(0, 0, 0);
    }, 50);
    redraw();
  }

  function loadNextPage(page) {
    isLoadingNextPage(true);
    xhr.games(userId, currentFilter(), page)
    .then(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      games(games().concat(data.paginator.currentPageResults));
      redraw();
    });
    redraw();
  }

  function onFilterChange(e) {
    currentFilter(e.target.value);
    xhr.games(userId, currentFilter(), 1, true)
    .then(loadInitialGames);
  }

  function toggleBookmark(index) {
    games()[index].bookmarked = !games()[index].bookmarked;
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
}
