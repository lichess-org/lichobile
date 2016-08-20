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

export function buildQS(obj) {
  const parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
    }
  }
  return parts.join('&');
}

function addQuerystring(url, querystring) {
  const prefix = url.indexOf('?') < 0 ? '?' : '&';
  let res = url + prefix + querystring;
  return res;
}

// convenient wrapper around m.request
function request(url, opts, feedback, uncache) {

  function onSuccess(data) {
    if (feedback) spinner.stop();
    redraw();
    return data;
  }

  function onError(error) {
    console.error(error);
    if (feedback) spinner.stop();
    redraw();
    throw error;
  }

  const cfg = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/vnd.lichess.v' + apiVersion + '+json',
      'Content-Type': 'application/json; charset=UTF-8'
    }
  };
  merge(cfg, opts);

  if (uncache) {
    url = addQuerystring(url, `_=${Date.now()}`);
  }

  if (opts && opts.query) {
    const query = buildQS(opts.query);
    if (query !== '') {
      url = addQuerystring(url, query);
    }
  }

  const promise = fetch(baseUrl + url, cfg);

  if (feedback) {
    spinner.spin(document.body);
  }

  return promise
    .then(checkStatus)
    .then(onSuccess)
    .catch(onError);
}

export function fetchJSON(url, opts, feedback, uncache) {
  return request(url, opts, feedback, uncache)
  .then(parseJSON);
}

export function fetchText(url, opts, feedback, uncache) {
  return request(url, opts, feedback, uncache)
  .then(r => r.text());
}
