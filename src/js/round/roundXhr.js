var utils = require('../utils');

var baseUrl = window.apiEndPoint;

function reload(ctrl) {
  ctrl.vm.reloading = true;
  m.redraw();
  return m.request({
    method: 'GET',
    url: baseUrl + ctrl.data.url.round,
    config: utils.xhrConfig
  }).then(function(data) {
    ctrl.vm.reloading = false;
    return data;
  }, function(err) {
    console.log(err);
  });
}

module.exports = {
  reload: reload
};
