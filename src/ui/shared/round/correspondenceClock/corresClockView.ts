import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import * as helper from '../../../helper'
import { hasNetwork } from '../../../../utils'
import { plural } from '../../../../i18n'

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
    str += plural('nbDays', days)
    if (hours !== 0) str += ' ' + plural('nbHours', hours)
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
  function cOnCreate(vnode: Mithril.VnodeDOM<any, any>) {
    const el = vnode.dom as HTMLElement
    el.textContent = formatClockTime(time * 1000)
    ctrl.els[color] = el
  }
  function cOnUpdate(vnode: Mithril.VnodeDOM<any, any>) {
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
