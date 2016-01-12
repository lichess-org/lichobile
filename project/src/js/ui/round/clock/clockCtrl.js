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

  this.data = data;

  this.update = function(white, black) {
    m.startComputation();
    this.data.white = white;
    this.data.black = black;
    setLastUpdate();
    m.endComputation();
  };

  this.tick = function(color) {
    this.data[color] = Math.max(0, lastUpdate[color] - (Date.now() - lastUpdate.at) / 1000);

    m.redraw();

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
