import * as h from 'mithril/hyperscript'
import * as helper from '../../../helper'
import { hasNetwork } from '../../../../utils'
import i18n from '../../../../i18n'

import CorresClockCtrl from './corresClockCtrl'

function prefixInteger(num: number, length: number) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2)
}

export function formatClockTime(time: number) {
  const date = new Date(time)
  const minutes = prefixInteger(date.getUTCMinutes(), 2)
  const seconds = prefixInteger(date.getSeconds(), 2)
  let hours, str = ''
  if (time >= 86400 * 1000) {
    // days : hours
    const days = date.getUTCDate() - 1
    hours = date.getUTCHours()
    str += (days === 1 ? i18n('oneDay') : i18n('nbDays', days))
    if (hours !== 0) str += ' ' + i18n('nbHours', hours)
  } else if (time >= 3600 * 1000) {
    // hours : minutes
    hours = date.getUTCHours()
    str += prefixInteger(hours, 2) + ':' + minutes
  } else {
    // minutes : seconds
    str += minutes + ':' + seconds
  }
  return str + (hasNetwork() ? '' : '?')
}

export function view(ctrl: CorresClockCtrl, color: Color, runningColor: Color) {
  const time = ctrl.data[color]
  const className = 'correspondence clock ' + helper.classSet({
    'outoftime': !time,
    'running': runningColor === color,
    'emerg': time < ctrl.data.emerg,
    'offline': !hasNetwork()
  })
  function cOnCreate(vnode: Mithril.DOMNode) {
    const el = vnode.dom as HTMLElement
    el.textContent = formatClockTime(time * 1000)
    ctrl.els[color] = el
  }
  function cOnUpdate(vnode: Mithril.DOMNode) {
    const el = vnode.dom as HTMLElement
    el.textContent = formatClockTime(time * 1000)
    ctrl.els[color] = el
  }
  return h('div', {
    className,
    oncreate: cOnCreate,
    onupdate: cOnUpdate
  })
}
