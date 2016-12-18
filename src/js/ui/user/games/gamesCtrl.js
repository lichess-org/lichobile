import * as xhr from '../userXhr';
import * as IScroll from 'iscroll/build/iscroll-probe';
import * as helper from '../../helper';
import spinner from '../../../spinner';
import redraw from '../../../utils/redraw';
import { throttle } from 'lodash/function';
import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import * as stream from 'mithril/stream';

var scroller;

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

export default function oninit(vnode) {
  const userId = vnode.attrs.id;
  const user = stream();
  const availableFilters = stream([]);
  const currentFilter = stream(vnode.attrs.filter || 'all');
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

  function formatDates(xhrData) {
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
    .then(formatDates)
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
    .then(formatDates)
    .then(loadInitialGames);
  }

  function toggleBookmark(index) {
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
}
