import { classSet } from '../../helper';

function prefixInteger(num, length) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

export function formatClockTime(ctrl, time) {
  var date = new Date(time);
  var minutes = prefixInteger(date.getUTCMinutes(), 2);
  var seconds = prefixInteger(date.getSeconds(), 2);
  var tenths;
  if (ctrl.data.showTenths && time < 10000) {
    tenths = Math.floor(date.getMilliseconds() / 100);
    return seconds + '.' + tenths;
  } else if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1);
    let pulse = seconds % 2 === 0 ? ':' : ' ';
    return hours + pulse + minutes;
  } else {
    return minutes + ':' + seconds;
  }
}

export function view(ctrl, color, runningColor) {
  var time = ctrl.data[color];
  return m('div', {
    className: 'clock ' + classSet({
      'outoftime': !time,
      'running': runningColor === color,
      'emerg': time < ctrl.data.emerg
    })
  }, [
    m('div.time', { id: 'clock_' + color }, formatClockTime(ctrl, time * 1000))
  ]);
}
