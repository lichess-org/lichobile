import * as xhr from '../userXhr';
import IScroll from 'iscroll/build/iscroll-probe';
import {throttle} from 'lodash/function';
import socket from '../../../socket';
import utils from '../../../utils';

var scroller;

const filters = {
  all: 'gamesPlayed',
  rated: 'rated',
  win: 'wins',
  loss: 'nbLosses',
  draw: 'nbDraws'
};

export default function controller() {
  const userId = m.route.param('id');
  const user = m.prop();
  const availableFilters = m.prop([]);
  const currentFilter = m.prop(m.route.param('filter') || 'all');
  const games = m.prop([]);
  const paginator = m.prop(null);
  const isLoadingNextPage = m.prop(false);

  socket.createDefault();

  xhr.user(userId).then(user, error => {
    utils.handleXhrError(error);
    m.route('/');
  }).then(() => {
    let f = Object.keys(user().count)
      .map(countToFilter)
      .filter(k => filters.hasOwnProperty(k))
      .map(k => {
        return {
          key: k,
          label: filters[k],
          count: user().count[filterToCount(k)]
        };
      });
      if (user().nbBookmark)
        f.push({ key: 'bookmark', label: 'nbBookmarks', count: user().nbBookmark });
    availableFilters(f);
  });

  function onScroll() {
    if (this.y + this.distY <= this.maxScrollY) {
      // lichess doesn't allow for more than 39 pages
      if (!isLoadingNextPage() && paginator().nextPage && paginator().nextPage < 40) {
        loadNextPage(paginator().nextPage);
      }
    }
  }

  function scrollerConfig(el, isUpdate, context) {
    if (!isUpdate) {
      scroller = new IScroll(el, {
        probeType: 2
      });
      scroller.on('scroll', throttle(onScroll, 150));
      context.onunload = () => {
        if (scroller) {
          scroller.destroy();
          scroller = null;
        }
      };
    }
    scroller.refresh();
  }

  function loadInitialGames() {
    xhr.games(userId, currentFilter(), 1, true).then(data => {
      paginator(data.paginator);
      games(data.paginator.currentPageResults);
    }, err => utils.handleXhrError(err)).then(() => setTimeout(() => {
      if (scroller) scroller.scrollTo(0, 0, 0);
    }, 50));
  }

  function loadNextPage(page) {
    isLoadingNextPage(true);
    xhr.games(userId, currentFilter(), page).then(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      games(games().concat(data.paginator.currentPageResults));
      m.redraw();
    }, err => utils.handleXhrError(err));
    m.redraw();
  }

  function onFilterChange(e) {
    currentFilter(e.target.value);
    loadInitialGames();
  }

  loadInitialGames();

  return {
    availableFilters,
    currentFilter,
    isLoadingNextPage,
    games,
    scrollerConfig,
    userId,
    onFilterChange,
    onunload() {
      socket.destroy();
    }
  };
}

function countToFilter(key) {
  if (key === 'game') return 'all';
  else return key;
}

function filterToCount(key) {
  if (key === 'all') return 'game';
  else return key;
}
