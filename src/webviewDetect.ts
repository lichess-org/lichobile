import * as UAParser from 'ua-parser-js'
import { safeStringToNum } from './utils'
import ButtonHandler from './ui/helper/button'
import { getButton, getAnchor } from './ui/helper'

export default function detectWebview() {
  const parser = new UAParser(navigator.userAgent)
  const os = parser.getOS()
  // if version not found, then we do nothing (assume 4.4)
  const osVersion: number = os.version ?
    (safeStringToNum(os.version.split('.')[0]) || 4) : 4
  const browser = parser.getBrowser()
  const webviewVersion = browser.version ?
    safeStringToNum(browser.version.split('.')[0]) : undefined

  if (os.name === 'Android' && osVersion > 4 && webviewVersion && webviewVersion < 58) {
    setTimeout(showPrompt, 2000)
  }

  function showPrompt() {
    const wrapper = document.createElement('div')
    wrapper.className = 'overlay_popup_wrapper fade-in'
    wrapper.id = 'webviewPrompt'
    const box = document.createElement('div')
    box.className = 'overlay_popup native_scroller'
    box.innerHTML =
    '<header><strong>Warning</strong></header>' +
    '<div class="popup_content">' +
      (osVersion >= 7 ? chromeUpgradeMsg : webviewUpgradeMsg) +
      '<div class="okBtn">' +
        '<button>OK</button>'
      '</div>' +
    '</div>'
    ButtonHandler(box, () => removePrompt(), undefined, undefined, undefined, undefined, getButton)
    ButtonHandler(box, openStore, undefined, undefined, undefined, undefined, getAnchor)
    wrapper.appendChild(box)
    document.body.appendChild(wrapper)
  }

  function openStore(e: TouchEvent) {
    const el = getAnchor(e)
    if (el && el.dataset.id) {
      window.open(`market://details?id=${el.dataset.id}`, '_system')
    }
  }

  function removePrompt() {
    const el = document.getElementById('webviewPrompt')
    if (el) {
      document.body.removeChild(el)
    }
  }

  const browserString = ' (' + browser.version + ')' || ''
  const chromeUpgradeMsg =
    '<p>Lichess relies heavily on Chrome application.</p>' +
    `<p>We detected the Chrome version you are using${browserString} is too old: lichess might not work properly.</p>` +
    `<p>To fix this, please <a href="#" data-id="com.android.chrome">upgrade Chrome application</a>.</p>`

  const webviewUpgradeMsg =
    '<p>Lichess relies heavily on System WebView application.</p>' +
    `<p>We detected the System WebView version you are using${browserString} is too old: lichess will not work properly.</p>` +
    `<p>To fix this, please <a href="#" data-id="com.google.android.webview">upgrade System WebView application</a>.</p>`
}
