import * as xhr from './tournamentXhr';
import throttle from 'lodash/throttle';

export default function(ctrl) {
  let reload = throttle((c) => {
    xhr.reload(c).then(c.reload);
  }, 2000);

  return {
    reload: function() {
      reload(ctrl);
    },
    resync: function() {
      xhr.resync(ctrl).then(ctrl.reload);
    }
  };
}
