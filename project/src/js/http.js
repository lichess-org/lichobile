import { encode as buildQueryString } from 'querystring';
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

function addQuerystring(url, querystring) {
  const prefix = url.indexOf('?') < 0 ? '?' : '&';
  let res = url + prefix + querystring;
  return res;
}

function request(url, opts, feedback, uncache) {

  function onSuccess(data) {
    if (feedback) spinner.stop();
    redraw();
    return data;
  }

  function onError(error) {
    if (feedback) spinner.stop();
    redraw();
    throw error;
  }

  const cfg = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/vnd.lichess.v' + apiVersion + '+json'
    }
  };

  merge(cfg, opts);

  // by default POST and PUT send json except if defined otherwise in caller
  if ((cfg.method === 'POST' || cfg.method === 'PUT') &&
    cfg.headers['Content-Type'] === undefined
  ) {
    cfg.headers['Content-Type'] = 'application/json; charset=UTF-8';
  }

  if (uncache) {
    url = addQuerystring(url, `_=${Date.now()}`);
  }

  if (opts && opts.query) {
    const query = buildQueryString(opts.query);
    if (query !== '') {
      url = addQuerystring(url, query);
    }
  }

  const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url;

  const promise = Promise.race([
    fetch(fullUrl, cfg),
    new Promise((resolve, reject) =>
      setTimeout(() => reject('Request timeout.'), 8000)
    )
  ]);

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
