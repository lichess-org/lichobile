import { merge } from 'lodash';
import spinner from './spinner';
import { buildQueryString } from './utils/querystring';

export const apiVersion = 2;

const baseUrl = window.lichess.apiEndPoint;

export interface RequestOpts extends RequestInit {
  query?: Object;
}

export interface FetchError extends Error {
  response: Response;
}

export function checkStatus(response: Response): Response {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    (error as any).response = response;
    throw error;
  }
}

function addQuerystring(url: string, querystring: string): string {
  const prefix = url.indexOf('?') < 0 ? '?' : '&';
  let res = url + prefix + querystring;
  return res;
}

export function request(url: string, opts?: RequestOpts, feedback = false): Promise<Response> {

  let timeoutId: number;

  function onSuccess(data: Response): Response {
    clearTimeout(timeoutId);
    if (feedback) spinner.stop();
    return data;
  }

  function onError(error: Error | Response) {
    clearTimeout(timeoutId);
    if (feedback) spinner.stop();
    return Promise.reject(error);
  }

  const cfg: RequestInit = {
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
    !(<StringMap>cfg.headers)['Content-Type']
  ) {
    (<StringMap>cfg.headers)['Content-Type'] = 'application/json; charset=UTF-8';
    // always send a json body
    if (!cfg.body) {
      cfg.body = '{}';
    }
  }

  if (opts && opts.query) {
    const query = buildQueryString(opts.query);
    if (query !== '') {
      url = addQuerystring(url, query);
    }
    delete opts.query;
  }

  const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url;

  const timeoutPromise: PromiseLike<Response> = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject('Request timeout.'), 10000);
  });

  const reqPromise: PromiseLike<Response> = fetch(fullUrl, cfg);

  const promise: Promise<Response> = Promise.race([
    reqPromise,
    timeoutPromise
  ]);

  if (feedback) {
    spinner.spin();
  }

  return promise
    .then(checkStatus)
    .then(onSuccess)
    .catch(onError);
}

export function fetchJSON<T>(url: string, opts?: RequestOpts, feedback = false): Promise<T> {
  return request(url, opts, feedback)
  .then(r => r.json<T>());
}

export function fetchText(url: string, opts?: RequestOpts, feedback = false): Promise<string> {
  return request(url, opts, feedback)
  .then(r => r.text());
}
