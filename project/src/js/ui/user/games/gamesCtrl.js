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
    utils.handleXhrError(error);
    m.route('/');
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
    xhr.games(userId, currentFilter(), 1, true)
    .run(data => {
      paginator(data.paginator);
      games(data.paginator.currentPageResults);
      setTimeout(() => {
        if (scroller) scroller.scrollTo(0, 0, 0);
      }, 50);
    })
    .catch(err => {
      utils.handleXhrError(err);
      m.route('/');
    })
  }

  function loadNextPage(page) {
    isLoadingNextPage(true);
    xhr.games(userId, currentFilter(), page)
    .run(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      games(games().concat(data.paginator.currentPageResults));
      m.redraw();
    })
    .catch(utils.handleXhrError);
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
