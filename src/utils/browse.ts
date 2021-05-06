import { Plugins } from '@capacitor/core'
import { fetchJSON } from '../http'
import globalConfig from '../config'
import session from '../session'

function createToken(): Promise<{ url: string }> {
  return fetchJSON('/auth/token', {method: 'POST'}, true)
}

export function openWebsitePage(path: string, withoutAuth = false) {
  const anonUrl = `${globalConfig.apiEndPoint}${path}`
  // we don't want to open a internal browser in kid mode since it is not
  // protected like the device browser can be
  if (!session.isKidMode()) {
    if (session.isConnected() && !withoutAuth) {
      createToken()
      .then((data: {url: string}) => {
        // we must use the Browser plugin to open authenticated pages because window.open
        // doesn't work inside a promise
        Plugins.Browser.open({ url: `${data.url}?referrer=${encodeURIComponent(path)}` })
      })
      .catch(() => {
        Plugins.Browser.open({ url: anonUrl })
      })
    } else {
      Plugins.Browser.open({ url: anonUrl })
    }
  } else {
    openExternalBrowser(anonUrl)
  }
}

export function openExternalBrowser(url: string): void {
  window.open(url, '_blank')
}
