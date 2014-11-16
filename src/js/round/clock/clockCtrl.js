var formatClockTime = require('./clockView').formatClockTime;

module.exports = function(data, outOfTime) {
  var lastUpdate;

  this.data = data;

  function setLastUpdate() {
    lastUpdate = {
      white: data.white,
      black: data.black,
      at: new Date()
    };
  }
  setLastUpdate();

  this.update = function(white, black) {
    this.data.white = white;
    this.data.black = black;
    setLastUpdate();
  };

  this.tick = function(color) {
    this.data[color] = Math.max(0, lastUpdate[color] - (new Date() - lastUpdate.at) / 1000);
    // performance hack: we don't want to call m.redraw() on every clock tick
    document.getElementById('clock_' + color).innerHTML =
    formatClockTime(this, this.data[color] * 1000);

    if (this.data[color] === 0) outOfTime();
  }.bind(this);
};
