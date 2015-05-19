import * as xhr from '../userXhr';
import IScroll from 'iscroll/build/iscroll-probe';
import {throttle} from 'lodash/function';
import socket from '../../../socket';
import i18n from '../../../i18n';

var scroller;

const availableFilters = [
  {key: 'all', label(nb) { return nb + ' ' + i18n('gamesPlayed'); }},
  {key: 'rated', label(nb) { return nb + ' ' + i18n('rated'); }},
  {key: 'win', label(nb) { return i18n('nbWins', nb); }},
  {key: 'loss', label(nb) { return i18n('nbLosses', nb); }},
  {key: 'draw', label(nb) { return i18n('nbDraws', nb); }}
];

export default function controller() {
  const userId = m.route.param('id');
  const currentFilter = m.prop(m.route.param('filter') || 'all');
  const games = m.prop([]);
  const paginator = m.prop(null);
  const isLoadingNextPage = m.prop(false);

  socket.createDefault();

  function onScroll() {
    if (this.y + this.distY <= this.maxScrollY) {
      console.log('loading next...');
      if (paginator().nextPage) {
        loadNext(paginator().nextPage);
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

  function loadGames() {
    xhr.games(userId, currentFilter(), 1, true).then(data => {
      console.log(data);
      paginator(data.paginator);
      games(data.paginator.currentPageResults);
    });
  }

  function loadNext(page) {
    isLoadingNextPage(true);
    xhr.games(userId, currentFilter(), page).then(data => {
      isLoadingNextPage(false);
      paginator(data.paginator);
      games(games().concat(data.paginator.currentPageResults));
      m.redraw();
    });
  }

  function onFilterChange(e) {
    currentFilter(e.target.value);
    loadGames(currentFilter(), 1);
  }

  loadGames(currentFilter(), 1);

  return {
    availableFilters,
    currentFilter,
    games,
    paginator,
    scrollerConfig,
    isLoadingNextPage,
    userId,
    onFilterChange,
    onunload() {
      socket.destroy();
    }
  };
}
