var http = require('../../http');

function reload(ctrl) {
  ctrl.vm.reloading = true;
  m.redraw();
  return http.request(ctrl.data.url.round).then(function(data) {
    ctrl.vm.reloading = false;
    return data;
  });
}

module.exports = {
  reload: reload
};
