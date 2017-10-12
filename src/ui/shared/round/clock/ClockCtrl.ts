import { GameData } from '../../../../lichess/interfaces/game'
import * as gameApi from '../../../../lichess/game'
import sound from '../../../../sound'
import { formatClockTime } from './clockView'

export type Seconds = number
export type Centis = number
export type Millis = number

interface ClockOpts {
  onFlag(): void
  soundColor: Color | null
}

interface Times {
  white: Millis
  black: Millis
  activeColor?: Color
  lastUpdate: Millis
}

interface EmergSound {
  play(): void
  next?: number
  delay: Millis,
  playable: {
    white: boolean
    black: boolean
  }
}

export default class ClockCtrl {

  emergSound: EmergSound = {
    play: sound.lowtime,
    delay: 20000,
    playable: {
      white: true,
      black: true
    }
  }

  times: Times

  emergMs: Millis

  elements = {
    white: null,
    black: null
  } as ColorMap<HTMLElement | null>

  constructor(d: GameData, public opts: ClockOpts) {
    const cdata = d.clock!

    this.emergMs = 1000 * Math.min(60, Math.max(10, cdata.initial * .125))

    this.setClock(d, cdata.white, cdata.black)
  }

  setClock = (d: GameData, white: Seconds, black: Seconds, delay: Centis = 0) => {
    const isClockRunning = gameApi.playable(d) &&
           ((d.game.turns - d.game.startedAtTurn) > 1 || d.clock!.running)

    this.times = {
      white: white * 1000,
      black: black * 1000,
      activeColor: isClockRunning ? d.game.player : undefined,
      lastUpdate: performance.now() + delay * 10
    }
  }

  addTime = (color: Color, time: Centis): void => {
    this.times[color] += time * 10
  }

  stopClock = (): void => {
    const color = this.times.activeColor
    if (color) {
      const curElapse = this.elapsed()
      this.times[color] = Math.max(0, this.times[color] - curElapse)
      this.times.activeColor = undefined
    }
  }

  tick = (): void => {
    const color = this.times.activeColor
    if (!color) return

    const now = performance.now()
    const millis = this.times[color] - this.elapsed(now)

    if (millis <= 0) this.opts.onFlag()
    else this.updateElement(color, millis)

    if (this.opts.soundColor === color) {
      if (this.emergSound.playable[color]) {
        if (millis < this.emergMs && !(now < this.emergSound.next!)) {
          this.emergSound.play()
          this.emergSound.next = now + this.emergSound.delay
          this.emergSound.playable[color] = false
        }
      } else if (millis > 1.5 * this.emergMs) {
        this.emergSound.playable[color] = true
      }
    }
  }

  updateElement(color: Color, millis: Millis) {
    const el = this.elements[color]
    if (el) {
      el.textContent = formatClockTime(millis, this.times.activeColor === color)
      if (millis < this.emergMs) el.classList.add('emerg')
      else el.classList.remove('emerg')
    }
  }

  elapsed = (now = performance.now()) => Math.max(0, now - this.times.lastUpdate)

  millisOf = (color: Color): Millis => (this.times.activeColor === color ?
     Math.max(0, this.times[color] - this.elapsed()) : this.times[color]
  )

  isRunning = () => this.times.activeColor !== undefined
}
