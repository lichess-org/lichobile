import * as merge from 'lodash/merge'
import spinner from './spinner'
import config from './config'
import { buildQueryString } from './utils/querystring'

export const apiVersion = 2

const baseUrl = config.apiEndPoint

export interface ErrorResponse {
  status: number
  // body is either json or text
  body: any
}

export interface RequestOpts extends RequestInit {
  query?: Object
}

function addQuerystring(url: string, querystring: string): string {
  const prefix = url.indexOf('?') < 0 ? '?' : '&'
  let res = url + prefix + querystring
  return res
}

// custom rejection handler factory
const makeRejectHandler =
  (reject: (reason: any) => any, status: number) => (body: any): ErrorResponse =>
    reject({
      status,
      body
    })

// lichess can return either json or text
// for convenience, this wrapper returns a promise with the response body already
// extracted
function request<T>(url: string, type: 'json' | 'text', opts?: RequestOpts, feedback = false): Promise<T> {

  let timeoutId: number

  function onComplete(): void {
    clearTimeout(timeoutId)
    if (feedback) spinner.stop()
  }

  const cfg: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/vnd.lichess.v' + apiVersion + '+json'
    }
  }

  merge(cfg, opts)

  // by default POST and PUT send json except if defined otherwise in caller
  if ((cfg.method === 'POST' || cfg.method === 'PUT') &&
    !(<StringMap>cfg.headers)['Content-Type']
  ) {
    (<StringMap>cfg.headers)['Content-Type'] = 'application/json; charset=UTF-8'
    // always send a json body
    if (!cfg.body) {
      cfg.body = '{}'
    }
  }

  if (opts && opts.query) {
    const query = buildQueryString(opts.query)
    if (query !== '') {
      url = addQuerystring(url, query)
    }
    delete opts.query
  }

  const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject('Request timeout.'), config.fetchTimeoutMs)
  })

  const respOrTimeout: Promise<Response> = Promise.race([
    fetch(fullUrl, cfg),
    timeoutPromise as Promise<Response>
  ])

  if (feedback) {
    spinner.spin()
  }

  return new Promise((resolve, reject) => {
    respOrTimeout
      .then((r: Response) => {
        onComplete()

        if (r.ok) {
          resolve(r[type]())
        }
        else {
          const withReject = makeRejectHandler(reject, r.status)

          // assume error is returned as json
          // if parsing fails, return text
          r.json()
          .then(withReject)
          .catch(() => {
            r.text()
            .then(withReject)
            .catch(withReject)
          })
        }
      })
      .catch(err => {
        onComplete()
        // network or timeout error
        reject({
          status: 0,
          body: err.message
        })
      })
  })
}

export function fetchJSON<T>(url: string, opts?: RequestOpts, feedback = false): Promise<T> {
  return request<T>(url, 'json', opts, feedback)
}

export function fetchText(url: string, opts?: RequestOpts, feedback = false): Promise<string> {
  return request<string>(url, 'text', opts, feedback)
}

export function post(url: string, opts?: RequestOpts, feedback = false): Promise<string> {
  // post request usually has a text body in response (and we don't care about it)
  const mergedOpts = Object.assign({}, opts, { method: 'POST' })
  return request<string>(url, 'text', mergedOpts, feedback)
}
