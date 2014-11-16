var formatClockTime = require('./clockView').formatClockTime;

module.exports = function(data, outOfTime) {
  var lastUpdate;
  var lastTick = {
    white: null,
    black: null
  };
  var clockEls = {
    white: null,
    black: null
  };

  function setLastUpdate() {
    lastUpdate = {
      white: data.white,
      black: data.black,
      at: new Date()
    };
  }
  setLastUpdate();

  function hasDisplayedTimeChanged(color, time) {
    var oldSeconds = new Date(lastTick[color]).getSeconds();
    var newSeconds = new Date(time).getSeconds();
    return (oldSeconds !== newSeconds) || time < 10000;
  }

  this.data = data;

  this.update = function(white, black) {
    this.data.white = white;
    this.data.black = black;
    setLastUpdate();
  };

  this.tick = function(color) {
    this.data[color] = Math.max(0, lastUpdate[color] - (new Date() - lastUpdate.at) / 1000);
    // performance hack: we don't want to call m.redraw() on every clock tick
    var time = this.data[color] * 1000,
    el;
    if (clockEls[color])
      el = clockEls[color];
    else {
      el = document.getElementById('clock_' + color);
      clockEls[color] = el;
    }
    if (hasDisplayedTimeChanged(color, time)) {
      el.innerHTML = formatClockTime(this, time);
    }
    lastTick[color] = time;

    if (this.data[color] === 0)
      outOfTime();
  }.bind(this);
};
