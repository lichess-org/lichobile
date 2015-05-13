var merge = require('lodash/object/merge');
var Spinner = require('spin.js');
var spinner = new Spinner({ color: '#C4A86F' });

var http = {};
http.apiVersion = 1;

var baseUrl = window.lichess.apiEndPoint;

function onSuccess(data) {
  spinner.stop();
  return data;
}

function onError(data) {
  spinner.stop();
  throw data;
}

function xhrConfig(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v' + http.apiVersion + '+json');
  xhr.timeout = 8000;
}

// convenient wrapper around m.request
http.request = function(url, opts, feedback) {

  var cfg = {
    url: baseUrl + url,
    method: 'GET',
    data: { '_': Date.now() },
    config: xhrConfig,
    deserialize: function(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw { response: 'Cannot read data from the server' };
      }
    },
    unwrapError: function(response, xhr) {
      return { response, status: xhr.status };
    }
  };
  merge(cfg, opts);

  var promise = m.request(cfg);

  if (feedback) {
    spinner.spin(document.body);
    return promise.then(onSuccess, onError);
  } else
    return promise;
};

module.exports = http;
