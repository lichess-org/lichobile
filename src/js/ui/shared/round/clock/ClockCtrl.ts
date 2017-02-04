import { formatClockTime } from './clockView';
import redraw from '../../../../utils/redraw';
import sound from '../../../../sound';

interface LastUpdate {
  white: number
  black: number
  at: number
}

interface ClockEls {
  white: HTMLElement | null
  black: HTMLElement | null
}

interface ClockBools {
  white: boolean
  black: boolean
}

export default class ClockCtrl {
  public data: ClockData
  public els: ClockEls
  public emerg: ClockBools
  public outOfTime: () => void

  private soundColor: Color
  private emergSound: { last: number, delay: number, playable: ClockBools }
  private lastUpdate: LastUpdate

  constructor(data: ClockData, outOfTime: () => void, soundColor: Color) {

    this.lastUpdate = {
      white: data.white,
      black: data.black,
      at: Date.now()
    }

    this.els = {
      black: null,
      white: null
    }

    this.emerg = {
      black: false,
      white: false
    }

    this.emergSound = {
      last: 0,
      delay: 5000,
      playable: {
        white: true,
        black: true
      }
    }

    this.outOfTime = outOfTime
    this.soundColor = soundColor
    this.data = data
  }

  private setLastUpdate(data: ClockData) {
    this.lastUpdate.white = data.white
    this.lastUpdate.black = data.black
    this.lastUpdate.at = Date.now()
  }

  public update(white: number, black: number) {
    this.data.white = white
    this.data.black = black
    this.setLastUpdate(this.data)
    if (this.els.white) this.els.white.textContent = formatClockTime(this.data.white * 1000);
    if (this.els.black) this.els.black.textContent = formatClockTime(this.data.black * 1000);
  }

  public tick(color: Color) {
    this.data[color] = Math.max(0, this.lastUpdate[color] - (Date.now() - this.lastUpdate.at) / 1000);
    const time = this.data[color] * 1000;
    const el = this.els[color];

    if (el) el.textContent = formatClockTime(time, true);

    if (this.data[color] < this.data.emerg && !this.emerg[color]) {
      this.emerg[color] = true;
      redraw();
    } else if (this.data[color] >= this.data.emerg && this.emerg[color]) {
      this.emerg[color] = false;
      redraw();
    }

    if (this.soundColor === color &&
      this.data[this.soundColor] < this.data.emerg &&
      this.emergSound.playable[this.soundColor]
    ) {
      if (!this.emergSound.last ||
        (this.data.increment && Date.now() - this.emergSound.delay > this.emergSound.last)
      ) {
        sound.lowtime();
        this.emergSound.last = Date.now();
        this.emergSound.playable[this.soundColor] = false;
      }
    } else if (this.soundColor === color && this.data[this.soundColor] > 2 * this.data.emerg && !this.emergSound.playable[this.soundColor]) {
      this.emergSound.playable[this.soundColor] = true;
    }

    if (this.data[color] === 0) this.outOfTime();
  }
}
