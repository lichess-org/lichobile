import helper from '../../helper';
import i18n from '../../../i18n';
import m from 'mithril';

function prefixInteger(num, length) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

export function formatClockTime(time) {
  var date = new Date(time);
  var minutes = prefixInteger(date.getUTCMinutes(), 2);
  var seconds = prefixInteger(date.getSeconds(), 2);
  var hours, str = '';
  if (time >= 86400 * 1000) {
    // days : hours
    var days = date.getUTCDate() - 1;
    hours = date.getUTCHours();
    str += (days === 1 ? i18n('oneDay') : i18n('nbDays', days)) + ' ';
    if (hours !== 0) str += i18n('nbHours', hours);
  } else if (time >= 3600 * 1000) {
    // hours : minutes
    hours = date.getUTCHours();
    str += prefixInteger(hours, 2) + ':' + minutes;
  } else {
    // minutes : seconds
    str += minutes + ':' + seconds;
  }
  return str;
}

export function view(ctrl, color, runningColor) {
  var time = ctrl.data[color];
  return m('div', {
    id: 'clock_' + color,
    className: 'correspondence clock ' + helper.classSet({
      'outoftime': !time,
      'running': runningColor === color,
      'emerg': time < ctrl.data.emerg
    })
  }, [
    m('div.time', formatClockTime(time * 1000))
  ]);
}
