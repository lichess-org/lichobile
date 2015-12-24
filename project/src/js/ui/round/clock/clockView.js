import { classSet } from '../../helper';

function prefixInteger(num, length) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

export function formatClockTime(ctrl, time, isRunning) {
  var date = new Date(time);
  var minutes = prefixInteger(date.getUTCMinutes(), 2);
  var seconds = prefixInteger(date.getUTCSeconds(), 2);
  var tenths = Math.floor(date.getUTCMilliseconds() / 100);
  let pulse = (isRunning && tenths > 5) ? ':' : isRunning ? ' ' : ':';

  if (ctrl.data.showTenths && time < 10000) {
    return minutes + pulse + seconds + '.' + tenths;
  }

  if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1);
    return hours + ':' + minutes + pulse + seconds;
  }

  return minutes + pulse + seconds;
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
  function cConfig(el) {
    requestAnimationFrame(() => el.textContent = formatClockTime(ctrl, time * 1000, isRunning));
  }
  return (
    <div id={'clock_' + color} className={className} config={cConfig} />
  );
}
