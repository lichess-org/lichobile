import helper from '../../helper';

function prefixInteger(num, length) {
  return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

const sepHigh = ':';
const sepLow = ' ';

export function formatClockTime(ctrl, time, isRunning) {
  var date = new Date(time);
  var minutes = prefixInteger(date.getUTCMinutes(), 2);
  var seconds = prefixInteger(date.getUTCSeconds(), 2);
  var tenths = Math.floor(date.getUTCMilliseconds() / 100);
  let pulse = (isRunning && tenths < 5) ? sepLow : sepHigh;

  if (ctrl.data.showTenths && time < 10000) {
    return seconds + '.' + tenths;
  }

  if (time >= 3600000) {
    let hours = prefixInteger(date.getUTCHours(), 1);
    return hours + sepHigh + minutes + pulse + seconds;
  }

  return minutes + pulse + seconds;
}

export function view(ctrl, color, runningColor) {
  const time = ctrl.data[color];
  const isRunning = runningColor === color;
  const className = helper.classSet({
    clock: true,
    outoftime: !time,
    running: isRunning,
    emerg: time < ctrl.data.emerg
  });
  function cConfig(el, isUpdate) {
    if (!isUpdate) {
      el.textContent = formatClockTime(ctrl, time * 1000, isRunning);
      ctrl.els[color] = el;
    }
  }
  return (
    <div className={className} config={cConfig} />
  );
}
