import storage from './storage'
import spinner from './spinner'
import globalConfig from './config'
import { buildQueryString } from './utils/querystring'

export const SESSION_ID_KEY = 'sessionId'

const baseUrl = globalConfig.apiEndPoint

export interface ErrorResponse {
  status: number
  // body is either json or text
  body: any
}

export interface RequestOpts {
  method?: 'GET' | 'POST'
  body?: any
  query?: Object
  headers?: StringMap
  cache?: RequestCache
  mode?: RequestMode
  credentials?: RequestCredentials
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

  if (opts && opts.query) {
    const query = buildQueryString(opts.query)
    if (query !== '') {
      url = addQuerystring(url, query)
    }
    delete opts.query
  }

  let cfg: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/vnd.lichess.v' + globalConfig.apiVersion + '+json'
    }
  }

  const sid = storage.get<string>(SESSION_ID_KEY)
  if (sid !== null) {
    const h = <StringMap>cfg.headers!
    h[SESSION_ID_KEY] = sid
  }


  // merge opts if they are defined
  if (opts !== undefined) {
    const { headers: optsHeaders, ...optsRest } = opts
    cfg = {
      ...cfg,
      ...optsRest,
    }
    cfg.headers! = {
      ...cfg.headers,
      ...optsHeaders
    } as HeadersInit
    // allow to remove header if caller specifically mark it as __delete
    // (important for cors)
    cfg.headers = Object.keys(cfg.headers!)
    .filter(k => {
      const p = (<StringMap>cfg.headers!)[k]
      return p !== '__delete'
    })
    .reduce((obj: StringMap, key: string) => {
      obj[key] = (<StringMap>cfg.headers!)[key]
      return obj
    }, {}) as HeadersInit
  }

  const init: RequestInit = {
    ...cfg,
    headers: new Headers(cfg.headers),
  }

  const headers: Headers = <Headers>init.headers

  // by default POST and PUT send json except if defined otherwise in caller
  if ((init.method === 'POST' || init.method === 'PUT') &&
    !headers.get('Content-Type')
  ) {
    headers.append('Content-Type', 'application/json; charset=UTF-8')
    // always send a json body
    if (!init.body) {
      init.body = '{}'
    }
  }

  const fullUrl = url.indexOf('http') > -1 ? url : baseUrl + url

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Request timeout.')),
      globalConfig.fetchTimeoutMs
    )
  })

  const respOrTimeout: Promise<Response> = Promise.race([
    fetch(fullUrl, init),
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
