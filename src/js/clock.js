'use strict';

var signals = require('./signals');

var Clock = function(time, $el) {
  var isRunning = false;
  var interval = null;

  function prefixInteger(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
  }

  function formatDate(date) {
    var minutes = prefixInteger(date.getMinutes(), 2);
    var seconds = prefixInteger(date.getSeconds(), 2);
    var tenths;
    if (time < 10000) {
      tenths = Math.floor(date.getMilliseconds() / 100);
      return seconds + '<span>.' + tenths + '</span>';
    } else if (time >= 3600000) {
      var hours = prefixInteger(date.getHours(), 2);
      return hours + ':' + minutes + ':' + seconds;
    } else {
      return minutes + ':' + seconds;
    }
  }

  function tick() {
    var html = formatDate(new Date(time));
    if (html !== $el.html()) {
      $el.html(html);
    }
  }

  function show() {
    $el.html(formatDate(new Date(time)));
    $el.show();
  }

  function start() {
    var endTime = Date.now() + time;
    isRunning = true;
    interval = setInterval(function() {
      if (isRunning) {
        var currTime = endTime - Date.now();
        if (currTime <= 0) {
          currTime = 0;
          stop();
          signals.buzzer.dispatch();
        }
        time = currTime;
        tick();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  function setTime(t) {
    time = Math.round(parseFloat(t) * 1000);
    tick();
  }

  function stop() {
    clearInterval(interval);
    isRunning = false;
  }

  return {
    show: show,
    start: start,
    setTime: setTime,
    stop: stop
  };
};


module.exports = Clock;
