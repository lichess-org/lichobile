import 'whatwg-fetch'

// The @types/node package defines the types of global and process, but also defines the type
// of setTimeout to return `NodeJS.Timeout` instead of window.setTimeout's `number`, which causes type errors
// all over the project. So we're not using it.
declare let global: any
declare let process: any

const testConfig = {
  apiEndPoint: 'http://test.org',
  fetchTimeoutMs: 10,
  apiVersion: 1
}

// must be before import http
import '../config'
jest.mock('../config', () => testConfig)

import * as http from '../http'

process.on('unhandledRejection', (_error: any) => {
  // catch all unhandled rejection here to avoid node warning
})

beforeAll(() => {
  global.Headers = Headers
})

describe('HTTP fetch wrapper', () => {
  test('if response ok, fetchJSON returns extracted json body', async () => {

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        ok: true,
        json() {
          return Promise.resolve({ data: 'hello' })
        }
      })
    })

    await expect(http.fetchJSON('/api/hello')).resolves.toEqual({ data: 'hello' })
  })

  test('if response ok, fetchText returns text', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        ok: true,
        text() {
          return Promise.resolve('ok')
        }
      })
    })

    await expect(http.fetchText('/api/hello')).resolves.toBe('ok')
  })

  test('if response not ok, extract JSON or fallback to text', async () => {
    global.fetch = jest.fn()
    .mockImplementationOnce(() => {
      const body = '{ "error": "bad" }'
      return Promise.resolve({
        status: 401,
        ok: false,
        json() {
          return Promise.resolve().then(() => JSON.parse(body))
        },
        text() {
          return Promise.resolve().then(() => body)
        }
      })
    })
    .mockImplementationOnce(() => {
      const body = 'bad'
      return Promise.resolve({
        status: 400,
        statusText: 'Bad request',
        ok: false,
        json() {
          return Promise.resolve().then(() => JSON.parse(body))
        },
        text() {
          return Promise.resolve().then(() => body)
        }
      })
    })

    await expect(http.fetchText('/api/hello')).rejects.toEqual({
      status: 401,
      body: { error: 'bad' }
    })

    await expect(http.fetchText('/api/hello')).rejects.toEqual({
      status: 400,
      body: 'Bad request'
    })
  })

  test('will reject on network error', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.reject(new Error('no network'))
    })

    await expect(http.fetchText('/api/hello')).rejects.toEqual({
      status: 0,
      body: 'no network'
    })
  })

  test('will reject on timeout', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          status: 200,
          ok: true,
          json() {
            return Promise.resolve({ data: 'hello' })
          }
        }), testConfig.fetchTimeoutMs + 100)
      })
    })

    await expect(http.fetchJSON('/api/test')).rejects.toEqual({
      status: 0,
      body: 'Request timeout.'
    })
  })

  test('request call fetch with correct url', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test')

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1)
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('http://test.org/api/test')
  })

  test('GET request call fetch with correct opts', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test')

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1)
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toEqual({
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.lichess.v1+json'
      })
    })
  })

  test('Request opts can be overriden', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test', {
      headers: {
        'Accept': 'application/json, text/*',
        'X-Requested-With': '__delete',
      },
      credentials: 'omit',
    })

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1)
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toEqual({
      method: 'GET',
      credentials: 'omit',
      headers: new Headers({
        'Accept': 'application/json, text/*'
      })
    })
  })

  test('GET query params are url encoded', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test', {
      query: {
        q: 'text url encoded',
        v: 1234
      }
    })

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1)
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('http://test.org/api/test?q=text%20url%20encoded&v=1234')
  })

  test('POST request call fetch with correct opts', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test', { method: 'POST' })

    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1)
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toEqual({
      method: 'POST',
      credentials: 'include',
      headers: new Headers({
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.lichess.v1+json',
        'Content-Type': 'application/json; charset=UTF-8'
      }),
      body: '{}'
    })
  })
})
