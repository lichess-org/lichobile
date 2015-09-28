import { formatClockTime } from './correspondenceView';

export default function(root, data, onFlag) {

  var lastUpdate;

  this.data = data;
  this.data.barTime = this.data.increment;

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
  }.bind(this);

  this.tick = function(color) {
    this.data[color] = Math.max(0, lastUpdate[color] - (new Date() - lastUpdate.at) / 1000);
    if (this.data[color] === 0) onFlag();

    const time = this.data[color] * 1000,
      el = document.getElementById('clock_' + color);

    if (el) el.innerHTML = formatClockTime(time);

  }.bind(this);
}
