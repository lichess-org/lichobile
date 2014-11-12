var m = require('mithril');
var utils = require('../utils');

var baseUrl = window.apiEndPoint;

function reload(ctrl) {
  ctrl.vm.reloading = true;
  m.redraw();
  var req = m.request({
    method: 'GET',
    url: baseUrl + ctrl.data.url.round,
    config: utils.xhrConfig
  });
  req.then(function() {
    ctrl.vm.reloading = false;
  }, function(err) {
    console.log(err);
  });
  return req;
}

module.exports = {
  reload: reload
};
