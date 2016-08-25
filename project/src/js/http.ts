import { merge } from 'lodash';
import spinner from './spinner';
import redraw from './utils/redraw';
import { buildQueryString } from './utils/querystring';

export const apiVersion = 2;

const baseUrl = window.lichess.apiEndPoint;

export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    throw {
      error,
      response
    };
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

export interface RequestOpts extends RequestInit {
  query?: Object;
}

export interface ResponseError {
  error: Error;
  response?: Response;
}

function request(url: string, opts?: RequestOpts, feedback = false): Promise<any> {

  let timeoutId;

  function onSuccess(data) {
    clearTimeout(timeoutId);
    if (feedback) spinner.stop();
    redraw();
    return data;
  }

  function onError(error) {
    clearTimeout(timeoutId);
    if (feedback) spinner.stop();
    redraw();
    throw error;
  }

  const cfg: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: <{[index: string]: string }> {
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

  if (opts && opts.query) {
    const query = buildQueryString(opts.query);
    if (query !== '') {
      url = addQuerystring(url, query);
    }
    delete opts.query;
  }

  const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url;

  const promise = Promise.race([
    fetch(fullUrl, cfg),
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject('Request timeout.'), 8000);
    })
  ]);

  if (feedback) {
    spinner.spin();
  }

  return promise
    .then(checkStatus)
    .then(onSuccess)
    .catch(onError);
}

export function fetchJSON(url: string, opts?: RequestOpts, feedback = false) {
  return request(url, opts, feedback)
  .then(parseJSON);
}

export function fetchText(url: string, opts?: RequestOpts, feedback = false) {
  return request(url, opts, feedback)
  .then(r => r.text());
}
