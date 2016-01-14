import * as xhr from '../userXhr';
import IScroll from 'iscroll/build/iscroll-probe';
import {throttle} from 'lodash/function';
import socket from '../../../socket';
import * as utils from '../../../utils';
import m from 'mithril';

var scroller;

export default function controller() {
  const userId = m.route.param('id');
  const variant = m.route.param('variant');

  const user = m.prop();

  socket.createDefault();

  xhr.user(userId).then(data => {
    user(data);
    return data;
  }, error => {
    utils.handleXhrError(error);
    m.route('/');
    throw error;
  });

  function loadVariantStats() {
    /*
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
    */
    return [];
  }

  const variantStats = loadVariantStats();

  return {
    variantStats,
    userId,
    variant,
    user,
    onunload() {
      socket.destroy();
    }
  };
}
