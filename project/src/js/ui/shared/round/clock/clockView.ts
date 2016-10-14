import * as helper from '../../../helper';
import * as m from 'mithril';

type ClockCtrl = any

export interface ClockAttrs {
  ctrl: ClockCtrl
  color: Color
  runningColor: Color
  isBerserk: boolean
}

function prefixInteger(num: number, length: number) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

const sepHigh = ':';
const sepLow = ' ';

export function formatClockTime(time: number, isRunning: boolean) {
  const date = new Date(time);
  const minutes = prefixInteger(date.getUTCMinutes(), 2);
  const seconds = prefixInteger(date.getUTCSeconds(), 2);
  const tenths = Math.floor(date.getUTCMilliseconds() / 100);
  let pulse = (isRunning && tenths < 5) ? sepLow : sepHigh;

  if (time < 10000) {
    return seconds + '.' + tenths;
  }

  if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1);
    return hours + pulse + minutes;
  }

  return minutes + sepHigh + seconds;
}

export default {
  oninit({ attrs }: Mithril.Vnode<ClockAttrs>) {
    const { ctrl, color, runningColor } = attrs;
    const time = ctrl.data[color];
    const isRunning = runningColor === color;
    this.clockOnCreate = function({ dom }: Mithril.Vnode<any>) {
      dom.textContent = formatClockTime(time * 1000, isRunning);
      ctrl.els[color] = dom;
    };
  },

  view({ attrs }: Mithril.Vnode<ClockAttrs>) {
    const { ctrl, color, runningColor, isBerserk } = attrs;
    const time = ctrl.data[color];
    const isRunning = runningColor === color;
    const className = helper.classSet({
      clock: true,
      outoftime: !time,
      running: isRunning,
      emerg: time < ctrl.data.emerg,
      berserk: isBerserk
    });
    return m('div', {
      className,
      oncreate: this.clockOnCreate
    });
  }
};
