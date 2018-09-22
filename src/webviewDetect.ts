import { safeStringToNum } from './utils'
import ButtonHandler from './ui/helper/button'
import { getButton, getAnchor } from './ui/helper'

const osPattern = /Android ([.0-9]+)/
const webviewPattern = /Chrome\/([.0-9]+)/

export default function detectWebview() {
  // if version not found, then we do nothing (assume 4.4)
  const osMatch = osPattern.exec(navigator.userAgent)
  const osVersion: number =
    osMatch ? (safeStringToNum(osMatch[1].split('.')[0]) || 4) : 4

  const webviewMatch = webviewPattern.exec(navigator.userAgent)
  const webviewVersion = webviewMatch ?
    safeStringToNum(webviewMatch[1].split('.')[0]) : undefined

  if (cordova.platformId === 'android' && osVersion > 4 && webviewVersion && webviewVersion < 58) {
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

  const chromeUpgradeMsg =
    '<p>Lichess relies heavily on Chrome application.</p>' +
    `<p>We detected the Chrome version you are using (${webviewVersion}) is too old: lichess might not work properly.</p>` +
    `<p>To fix this, please <a href="#" data-id="com.android.chrome">upgrade Chrome application</a>.</p>`

  const webviewUpgradeMsg =
    '<p>Lichess relies heavily on System WebView application.</p>' +
    `<p>We detected the System WebView version you are using (${webviewVersion}) is too old: lichess will not work properly.</p>` +
    `<p>To fix this, please <a href="#" data-id="com.google.android.webview">upgrade System WebView application</a>.</p>`
}
