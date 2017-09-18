import { formatClockTime } from './corresClockView'
import { CorrespondenceClockData } from '../../../../lichess/interfaces/game'

interface LastUpdate {
  white: number
  black: number
  at: number
}

interface ClockEls {
  white: HTMLElement | null
  black: HTMLElement | null
}

export default class CorresClockCtrl {
  public data: CorrespondenceClockData
  public els: ClockEls
  public onFlag: () => void

  private lastUpdate: LastUpdate

  constructor(data: CorrespondenceClockData, onFlag: () => void) {
    this.lastUpdate = {
      white: data.white,
      black: data.black,
      at: Date.now()
    }

    this.els = {
      black: null,
      white: null
    }

    this.data = data
    this.onFlag = onFlag
  }

  private setLastUpdate(data: CorrespondenceClockData) {
    this.lastUpdate.white = data.white
    this.lastUpdate.black = data.black
    this.lastUpdate.at = Date.now()
  }

  public update(white: number, black: number) {
    this.data.white = white
    this.data.black = black
    this.setLastUpdate(this.data)
  }

  public tick(color: Color) {
    this.data[color] = Math.max(0, this.lastUpdate[color] - (Date.now() - this.lastUpdate.at) / 1000)
    if (this.data[color] === 0) this.onFlag()

    const time = this.data[color] * 1000
    const el = this.els[color]

    if (el) el.textContent = formatClockTime(time)
  }

}
