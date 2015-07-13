import { classSet } from '../../helper';
import m from 'mithril';

function prefixInteger(num, length) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

export function formatClockTime(ctrl, time, isRunning) {
  var date = new Date(time);
  var minutes = prefixInteger(date.getUTCMinutes(), 2);
  var seconds = prefixInteger(date.getUTCSeconds(), 2);
  var tenths = Math.floor(date.getUTCMilliseconds() / 100);
  if (ctrl.data.showTenths && time < 10000) {
    return seconds + '.' + tenths;
  } else if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1);
    let pulse = (isRunning && tenths > 5) ? ':' : ' ';
    if (isRunning)
      return hours + pulse + minutes;
    else
      return hours + ':' + minutes;
  } else {
    return minutes + ':' + seconds;
  }
}

export function view(ctrl, color, runningColor) {
  const time = ctrl.data[color];
  const isRunning = runningColor === color;
  return m('div', {
    className: 'clock ' + classSet({
      outoftime: !time,
      running: isRunning,
      emerg: time < ctrl.data.emerg
    })
  }, [
    m('div.time', { id: 'clock_' + color }, formatClockTime(ctrl, time * 1000, isRunning))
  ]);
}
