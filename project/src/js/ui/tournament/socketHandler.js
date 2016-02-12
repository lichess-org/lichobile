import * as xhr from './tournamentXhr';

export default function(ctrl) {

  const handlers = {
    reload: function() {
      xhr.reload(ctrl).then(ctrl.reload);
    },
    resync: function() {
      xhr.reload(ctrl).then(ctrl.reload);
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
