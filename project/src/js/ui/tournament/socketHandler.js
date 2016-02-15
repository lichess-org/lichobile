import * as xhr from './tournamentXhr';
import throttle from 'lodash/function/throttle';

export default function(ctrl) {
  let reload = throttle((c) => {
    xhr.reload(c).then(c.reload);
  }, 2000);

  const handlers = {
    reload: function() {
      console.log('reload handler');
      reload(ctrl);
    },
    resync: function() {
      console.log('resync handler');
      xhr.resync(ctrl).then(ctrl.reload);
    }
  };

  return function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  };
}
