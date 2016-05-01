import merge from 'lodash/merge';
import spinner from './spinner';
import m from 'mithril';

export const apiVersion = 1;

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
  xhr.withCredentials = true;
  xhr.timeout = 8000;
}

// convenient wrapper around m.request
export function request(url, opts, feedback, xhrConf) {

  var cfg = {
    url: 'http://' + baseUrl + url,
    method: 'GET',
    data: { },
    config: xhrConf || xhrConfig,
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

  if (cfg.method === 'GET') {
    cfg.data._ = Date.now();
  }

  var promise = m.request(cfg);

  if (feedback) {
    spinner.spin(document.body);
    return promise.then(onSuccess, onError);
  } else
    return promise;
}
