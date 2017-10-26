import * as helper from '../../../helper'
import * as h from 'mithril/hyperscript'
import ClockCtrl from './ClockCtrl'

export interface ClockAttrs {
  ctrl: ClockCtrl
  color: Color
  runningColor?: Color
  isBerserk: boolean
}

interface ClockState {
  clockOnCreate(vnode: Mithril.DOMNode): void
  clockOnUpdate(vnode: Mithril.DOMNode): void
}

export default {
  oninit({ attrs }) {
    const { ctrl, color } = attrs
    this.clockOnCreate = ({ dom }: Mithril.DOMNode) => {
      ctrl.elements[color] = dom as HTMLElement
      ctrl.updateElement(color, ctrl.millisOf(color))
    }
    this.clockOnUpdate = ({ dom }: Mithril.DOMNode) => {
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
export function formatClockTime(time: Millis, isRunning: boolean = false) {
  const date = new Date(time)
  const minutes = prefixInteger(date.getUTCMinutes(), 2)
  const seconds = prefixInteger(date.getUTCSeconds(), 2)
  const tenths = Math.floor(date.getUTCMilliseconds() / 100)
  let pulse = (isRunning && tenths < 5) ? sepLow : sepHigh

  if (time < 10000) {
    return seconds + '.' + tenths
  }

  if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1)
    return hours + pulse + minutes
  }

  return minutes + sepHigh + seconds
}

function prefixInteger(num: number, length: number) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2)
}
