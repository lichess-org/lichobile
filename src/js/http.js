var assign = require('lodash-node/modern/objects/merge');

var http = {};

http.xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

var baseUrl = window.apiEndPoint;

// convenient wrapper around m.request
http.request = function(url, opts) {
  var cfg = {
    url: baseUrl + url,
    method: 'GET',
    config: http.xhrConfig
  };
  assign(cfg, opts);
  return m.request(cfg);
};

module.exports = http;
