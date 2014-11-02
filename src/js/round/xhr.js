var m = require('mithril');

var xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

function reload(ctrl) {
  ctrl.vm.reloading = true;
  m.redraw();
  var req = m.request({
    method: 'GET',
    url: ctrl.data.url.round,
    config: xhrConfig
  });
  // TODO
  // req.then(function() {
  // }, function(err) {
  // });
  return req;
}

module.exports = {
  reload: reload
};
