import * as xhr from '../tournamentXhr';
import throttle from 'lodash/function/throttle';
import m from 'mithril';

export default function(ctrl) {
  let reload = throttle((c) => {
    xhr.reload(c.tournament().id).then(c.reload);
  }, 2000);

  const handlers = {
    reload: function() {
      reload(ctrl);
    },
    resync: function() {
      xhr.resync(ctrl.tournament().id).then(ctrl.reload);
    },
    redirect: function(gameId) {
      m.route('/tournament/' + ctrl.tournament().id + '/game/' + gameId);
    }
  };

  return handlers;
}
