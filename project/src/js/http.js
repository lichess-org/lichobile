import merge from 'lodash/object/merge';
import Spinner from 'spin.js';
import m from 'mithril';

const spinner = new Spinner({ color: '#C4A86F' });

export const apiVersion = 1;
export const lichessSri = Math.random().toString(36).substring(2);

const baseUrl = window.lichess.apiEndPoint;

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
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v' + apiVersion + '+json');
  xhr.timeout = 8000;
}

// convenient wrapper around m.request
export function request(url, opts, feedback) {

  var cfg = {
    url: 'http://' + baseUrl + url,
    method: 'GET',
    data: { '_': Date.now() },
    config: xhrConfig,
    deserialize: function(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw { response: { error: 'Cannot read data from the server' }};
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
}
