'use strict';

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
    var endTime = new Date().getTime() + time;
    isRunning = true;
    interval = setInterval(function() {
      if (isRunning) {
        var currTime = endTime - new Date().getTime();
        if (currTime <= 0) {
          clearInterval(interval);
          currTime = 0;
        }
        time = currTime;
        tick();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  function setTime(time) {
    time = Math.round(parseFloat(time) * 1000);
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
