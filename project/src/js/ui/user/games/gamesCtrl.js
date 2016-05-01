import * as xhr from '../userXhr';
import IScroll from 'iscroll/build/iscroll-probe';
import throttle from 'lodash/throttle';
import socket from '../../../socket';
import * as utils from '../../../utils';
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

export default function controller() {
  const userId = m.route.param('id');
  const user = m.prop();
  const availableFilters = m.prop([]);
  const currentFilter = m.prop(m.route.param('filter') || 'all');
  const games = m.prop([]);
  const paginator = m.prop(null);
  const isLoadingNextPage = m.prop(false);

  socket.createDefault();

  xhr.user(userId).then(data => {
    user(data);
    return data;
  }, error => {
    utils.handleXhrError(error);
    m.route('/');
    throw error;
  }).then(data => {
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
    }, err => {
      utils.handleXhrError(err);
      m.route('/');
    })
    .then(() => setTimeout(() => {
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

  function toggleBookmark(index) {
    games()[index].bookmarked = !games()[index].bookmarked;
  }

  loadInitialGames();

  return {
    availableFilters,
    currentFilter,
    isLoadingNextPage,
    games,
    scrollerConfig,
    userId,
    user,
    onFilterChange,
    toggleBookmark
  };
}
