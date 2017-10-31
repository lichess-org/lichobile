const testConfig = {
  apiEndPoint: 'http://test.org',
  fetchTimeoutMs: 10,
  apiVersion: 1
}

// must be before import
jest.mock('../config', () => {
  return {
    'default': testConfig
  }
})

import * as http from '../http'

process.on('unhandledRejection', error => {
  // catch all unhandled rejection here to avoid node warning
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
      body: 'bad'
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

    expect(global.fetch.mock.calls.length).toBe(1)
    expect(global.fetch.mock.calls[0][0]).toBe('http://test.org/api/test')
  })

  test('GET request call fetch with correct opts', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test')

    expect(global.fetch.mock.calls.length).toBe(1)
    expect(global.fetch.mock.calls[0][1]).toEqual({
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.lichess.v1+json'
      }
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

    expect(global.fetch.mock.calls.length).toBe(1)
    expect(global.fetch.mock.calls[0][0]).toBe('http://test.org/api/test?q=text%20url%20encoded&v=1234')
  })

  test('POST request call fetch with correct opts', () => {
    global.fetch = jest.fn()

    http.fetchJSON('/api/test', { method: 'POST' })

    expect(global.fetch.mock.calls.length).toBe(1)
    expect(global.fetch.mock.calls[0][1]).toEqual({
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.lichess.v1+json',
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: '{}'
    })
  })
})
