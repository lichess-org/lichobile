export interface Config {
  mode: 'dev' | 'release'
  apiEndPoint: string
  socketEndPoint: string
  sentryDSN: string
  fetchTimeoutMs: Millis
}

const defaults = {
  fetchTimeoutMs: 10000
}

const config = Object.assign({}, defaults, window.lichess)

export default config
