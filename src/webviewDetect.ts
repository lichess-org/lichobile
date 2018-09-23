import * as h from 'mithril/hyperscript'
import { safeStringToNum } from './utils'
import promptDialog from './prompt'
import { getAnchor, ontap } from './ui/helper'

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
    const content = h('div', {
      oncreate: ontap(openStore, undefined, undefined, getAnchor)
    }, upgradeMsg().concat([
        h('div.buttons', h('button', { oncreate: ontap(promptDialog.hide) }, 'OK')),
      ])
    )
    promptDialog.show(content, 'Warning')
  }

  function openStore(e: TouchEvent) {
    const el = getAnchor(e)
    if (el && el.dataset.id) {
      window.open(`market://details?id=${el.dataset.id}`, '_system')
    }
  }

  function upgradeMsg() {
    const appName = osVersion >= 7 ? 'Chrome' : 'System WebView'
    const appPackage = osVersion >= 7 ? 'com.android.chrome' : 'com.google.android.webview'
    return [
      h('p', `Lichess relies heavily on ${appName} application.`),
      h('p', `We detected the ${appName} version you have currently installed (${webviewVersion}) is too old: lichess might not work properly.`),
      h('p', [
        'To fix this, please ',
        h('a', {
          href: '#',
          'data-id': appPackage,
        }, `upgrade ${appName} application.`)
      ])
    ]
  }
}
