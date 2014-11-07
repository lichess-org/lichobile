var m = require('mithril');

var xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

var baseUrl = window.apiEndPoint;

function reload(ctrl) {
  ctrl.vm.reloading = true;
  m.redraw();
  var req = m.request({
    method: 'GET',
    url: baseUrl + ctrl.data.url.round,
    config: xhrConfig
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
