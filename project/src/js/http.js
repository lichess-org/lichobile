import merge from 'lodash/merge';
import spinner from './spinner';
import m from 'mithril';

export const apiVersion = 2;

const baseUrl = window.lichess.apiEndPoint;


function xhrConfig(xhr) {
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Accept', 'application/vnd.lichess.v' + apiVersion + '+json');
  xhr.withCredentials = true;
  xhr.timeout = 8000;
}

// convenient wrapper around m.request
export function request(url, opts, feedback, xhrConf) {
  let curXhr;

  function onSuccess(data) {
    spinner.stop();
    return data;
  }

  function onError(data) {
    throw { response: data, status: curXhr.status };
  }

  const cfg = {
    url: baseUrl + url,
    method: 'GET',
    data: { },
    config: xhr => {
      curXhr = xhr;
      if (xhrConf) xhrConf(xhr);
      else xhrConfig(xhr);
    },
    deserialize: function(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw { response: { error: 'Cannot read data from the server' }};
      }
    }
  };
  merge(cfg, opts);

  if (cfg.method === 'GET') {
    cfg.data._ = Date.now();
  }

  const stream = m.request(cfg);

  if (feedback) {
    spinner.spin(document.body);
    return stream
    .run(onSuccess)
    .catch(data => {
      spinner.stop();
      onError(data);
    });
  } else {
    return stream
    .catch(onError);
  }
}
