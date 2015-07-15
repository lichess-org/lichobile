import { classSet } from '../../helper';

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
  }

  if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1);
    let pulse = (isRunning && tenths > 5) ? ':' : ' ';
    if (isRunning)
      return hours + pulse + minutes;
    else
      return hours + ':' + minutes;
  }

  return minutes + ':' + seconds;
}

export function view(ctrl, color, runningColor) {
  const time = ctrl.data[color];
  const isRunning = runningColor === color;
  const className = classSet({
    clock: true,
    outoftime: !time,
    running: isRunning,
    emerg: time < ctrl.data.emerg
  });
  return (
    <div id={'clock_' + color} className={className}>
      {formatClockTime(ctrl, time * 1000, isRunning)}
    </div>
  );
}
