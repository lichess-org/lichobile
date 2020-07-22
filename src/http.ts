import storage from './storage'
import spinner from './spinner'
import globalConfig from './config'
import { buildQueryString } from './utils/querystring'

export const SESSION_ID_KEY = 'sessionId'

const baseUrl = globalConfig.apiEndPoint

export interface ErrorResponse {
  status: number
  // body is either json or text
  body?: any
}

export interface RequestOpts {
  method?: 'GET' | 'POST'
  body?: any
  query?: Object
  headers?: Record<string, string>
  cache?: RequestCache
  mode?: RequestMode
  credentials?: RequestCredentials
  timeout?: number
}

function addQuerystring(url: string, querystring: string): string {
  const prefix = url.indexOf('?') < 0 ? '?' : '&'
  let res = url + prefix + querystring
  return res
}

// lichess can return either json or text
// for convenience, this wrapper returns a promise with the response body already
// extracted
function request<T>(url: string, type: 'json' | 'text', opts?: RequestOpts, feedback = false): Promise<T> {

  let timeoutId: number

  function onComplete(): void {
    clearTimeout(timeoutId)
    if (feedback) spinner.stop()
  }

  const headers = new Headers({
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/vnd.lichess.v' + globalConfig.apiVersion + '+json'
  })

  const sid = storage.get<string>(SESSION_ID_KEY)
  if (sid !== null) {
    headers.append(SESSION_ID_KEY, sid)
  }

  const cfg: RequestInit = {
    method: 'GET',
    credentials: 'include',
  }

  let fetchTimeoutMs: number | undefined

  // merge opts if they are defined
  if (opts !== undefined) {
    const { headers: optsHeaders, query, timeout, ...optsRest } = opts

    fetchTimeoutMs = timeout

    if (query) {
      const qs = buildQueryString(query)
      if (qs !== '') {
        url = addQuerystring(url, qs)
      }
    }

    Object.assign(cfg, optsRest)

    // allow to remove header if caller specifically mark it as __delete
    // (important for cors)
    if (optsHeaders) {
      Object.keys(optsHeaders)
      .forEach(k => {
        const v = optsHeaders[k]
        if (v !== '__delete') {
          headers.set(k, v)
        } else {
          headers.delete(k)
        }
      })
    }
  }

  // by default POST and PUT send json except if defined otherwise in caller
  if ((cfg.method === 'POST' || cfg.method === 'PUT') && !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json; charset=UTF-8')
    // always send a json body
    if (!cfg.body) {
      cfg.body = '{}'
    }
  }

  const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Request timeout.')),
      fetchTimeoutMs || globalConfig.fetchTimeoutMs
    )
  })

  const respOrTimeout: Promise<Response> = Promise.race([
    fetch(fullUrl, { ...cfg, headers }),
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
          // assume error is returned as json
          // if parsing fails, return text
          r.text()
          .then((bodyText: string) => {
            try {
              reject({
                status: r.status,
                body: JSON.parse(bodyText)
              })
            } catch (_) {
              reject({
                status: r.status,
                body: r.statusText
              })
            }
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
