import { formatClockTime } from './clockView';
import sound from '../../../sound';
import m from 'mithril';

export default function ctrl(data, outOfTime, soundColor) {
  const lastUpdate = {};

  const emergSound = {
    last: null,
    delay: 5000,
    playable: {
      white: true,
      black: true
    }
  };

  function setLastUpdate() {
    lastUpdate.white = data.white;
    lastUpdate.black = data.black;
    lastUpdate.at = Date.now();
  }
  setLastUpdate();

  this.els = {
    black: null,
    white: null
  };

  this.emerg = {
    black: false,
    white: false
  };

  this.data = data;

  this.update = function(white, black) {
    this.data.white = white;
    this.data.black = black;
    setLastUpdate();
    if (this.els.white) this.els.white.textContent = formatClockTime(this, this.data.white * 1000);
    if (this.els.black) this.els.black.textContent = formatClockTime(this, this.data.black * 1000);
  };

  this.tick = function(color) {
    this.data[color] = Math.max(0, lastUpdate[color] - (Date.now() - lastUpdate.at) / 1000);
    const time = this.data[color] * 1000;
    const el = this.els[color];

    if (el) el.textContent = formatClockTime(this, time, true);

    if (this.data[color] < this.data.emerg && !this.emerg[color]) {
      this.emerg[color] = true;
      m.redraw();
    } else if (this.data[color] >= this.data.emerg && this.emerg[color]) {
      this.emerg[color] = false;
      m.redraw();
    }

    if (soundColor === color &&
      this.data[soundColor] < this.data.emerg &&
      emergSound.playable[soundColor]
    ) {
      if (!emergSound.last ||
        (data.increment && Date.now() - emergSound.delay > emergSound.last)
      ) {
        sound.lowtime();
        emergSound.last = Date.now();
        emergSound.playable[soundColor] = false;
      }
    } else if (soundColor === color && this.data[soundColor] > 2 * this.data.emerg && !emergSound.playable[soundColor]) {
      emergSound.playable[soundColor] = true;
    }

    if (this.data[color] === 0) outOfTime();

  }.bind(this);
}
