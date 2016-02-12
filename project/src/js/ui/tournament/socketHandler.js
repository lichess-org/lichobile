import * as xhr from './tournamentXhr';

export default function(ctrl) {
  const handlers = {
    reload: function() {
      reload();
    },
    resync: function() {
      reload();
    }
  };

  let lastReloadTime = 0;
  const THROTTLE_TIME = 2000; // No more than one reload every two seconds

  function reload () {
    let curTime = (new Date()).getTime();
    if ((curTime - THROTTLE_TIME) > lastReloadTime) {
      xhr.reload(ctrl).then(ctrl.reload);
      lastReloadTime = curTime;
    }
  }

  return function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  };
}
