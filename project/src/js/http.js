import merge from 'lodash/merge';
import spinner from './spinner';
import redraw from './utils/redraw';

export const apiVersion = 2;

const baseUrl = window.lichess.apiEndPoint;

export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

export function parseJSON(response) {
  return response.json();
}

// convenient wrapper around m.request
export function request(url, opts, feedback) {

  function onSuccess(data) {
    if (feedback) spinner.stop();
    redraw();
    return data;
  }

  function onError(error) {
    if (feedback) spinner.stop();
    redraw();
    throw { response: error, status: error.status };
  }

  const cfg = {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/vnd.lichess.v' + apiVersion + '+json'
    }
  };
  merge(cfg, opts);

  // if (cfg.method === 'GET') {
  //   cfg.data._ = Date.now();
  // }

  const promise = fetch(baseUrl + url, cfg);

  if (feedback) {
    spinner.spin(document.body);
  }

  return promise
    .then(checkStatus)
    .then(parseJSON)
    .then(onSuccess)
    .catch(onError);
}
