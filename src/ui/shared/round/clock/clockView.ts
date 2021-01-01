import * as helper from '../../../helper'
import h from 'mithril/hyperscript'
import ClockCtrl from './ClockCtrl'

export interface ClockAttrs {
  ctrl: ClockCtrl
  color: Color
  runningColor?: Color
  isBerserk: boolean
}

interface ClockState {
  clockOnCreate(vnode: Mithril.VnodeDOM<any, any>): void
  clockOnUpdate(vnode: Mithril.VnodeDOM<any, any>): void
}

export default {
  oninit({ attrs }) {
    const { ctrl, color } = attrs
    this.clockOnCreate = ({ dom }: Mithril.VnodeDOM<any, any>) => {
      ctrl.elements[color] = dom as HTMLElement
      ctrl.updateElement(color, ctrl.millisOf(color))
    }
    this.clockOnUpdate = ({ dom }: Mithril.VnodeDOM<any, any>) => {
      ctrl.elements[color] = dom as HTMLElement
      ctrl.updateElement(color, ctrl.millisOf(color))
    }
  },

  view({ attrs }) {
    const { ctrl, color, runningColor, isBerserk } = attrs
    const time = ctrl.millisOf(color)
    const isRunning = runningColor === color
    const className = helper.classSet({
      clock: true,
      outoftime: !time,
      running: isRunning,
      berserk: isBerserk
    })
    return h('div', {
      className,
      oncreate: this.clockOnCreate,
      onupdate: this.clockOnUpdate
    })
  }
} as Mithril.Component<ClockAttrs, ClockState>

const sepHigh = ':'
const sepLow = ' '
export function formatClockTime(time: Millis, showTenths: boolean, isRunning = false): string {
  const date = new Date(time)
  const millis = date.getUTCMilliseconds()
  const minutes = pad2(date.getUTCMinutes())
  const seconds = pad2(date.getUTCSeconds())

  if (time >= 3600000) {
    const hours = pad2(date.getUTCHours())
    const pulse = (isRunning && millis < 500) ? sepLow : sepHigh
    return hours + pulse + minutes
  } else if (showTenths) {
    let tenthsStr = Math.floor(millis / 100).toString()
    if (!isRunning && time < 1000) {
      tenthsStr += '<huns>' + (Math.floor(millis / 10) % 10) + '</huns>'
    }
    return minutes + sepHigh + seconds + '<tenths>.' + tenthsStr + '</tenths>'
  }

  return minutes + sepHigh + seconds
}

function pad2(num: number): string {
 return (num < 10 ? '0' : '') + num
}
