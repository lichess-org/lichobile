var assign = require('lodash-node/modern/objects/merge');

var http = {};

http.xhrConfig = function(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v1+json');
};

var baseUrl = window.apiEndPoint;

// throw an error message that may be given to i18n() function and displayed
// to the user
function extract(xhr) {
  var s = xhr.status;
  if (s === 0)
    throw new Error('lichessIsNotReachableError');
  else if (s === 401)
    throw new Error('unauthorizedError');
  else if (s === 404)
    throw new Error('resourceNotFoundError');
  else if (s === 503)
    throw new Error('lichessIsUnavailableError');
  else if (s >= 500)
    throw new Error('serverError');

  return xhr.responseText.length === 0 ? null : xhr.responseText;
}

function uncache(url) {
  return url + '?_=' + new Date().getTime();
}

// convenient wrapper around m.request
http.request = function(url, opts) {
  var cfg = {
    url: uncache(baseUrl + url),
    method: 'GET',
    config: http.xhrConfig,
    extract: extract
  };
  assign(cfg, opts);
  return m.request(cfg);
};

module.exports = http;
