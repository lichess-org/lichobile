import { OnlineGameData } from '../../../../lichess/interfaces/game'
import * as gameApi from '../../../../lichess/game'
import sound from '../../../../sound'
import { formatClockTime } from './clockView'

export type Seconds = number
export type Centis = number
export type Millis = number

interface ClockOpts {
  onFlag(): void
  soundColor: Color | null
  showTenths: 0 | 1 | 2
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
  public showTenths: (millis: Millis) => boolean

  private tickTimeoutID?: number

  emergSound: EmergSound = {
    play: sound.lowtime,
    delay: 20000,
    playable: {
      white: true,
      black: true
    }
  }

  times!: Times

  emergMs: Millis

  elements = {
    white: null,
    black: null
  } as ColorMap<HTMLElement | null>

  constructor(d: OnlineGameData, public opts: ClockOpts) {
    const cdata = d.clock!

    if (opts.showTenths === 0) this.showTenths = () => false
    else {
      const cutoff = opts.showTenths === 1 ? 10000 : 3600000
      this.showTenths = (time) => time < cutoff
    }

    this.emergMs = 1000 * Math.min(60, Math.max(10, cdata.initial * .125))

    this.setClock(d, cdata.white, cdata.black)
  }

  setClock = (d: OnlineGameData, white: Seconds, black: Seconds, delay: Centis = 0) => {
    const isClockRunning = gameApi.playable(d) &&
           (gameApi.playedTurns(d) > 1 || d.clock!.running)
    const delayMs = delay * 10

    this.times = {
      white: white * 1000,
      black: black * 1000,
      activeColor: isClockRunning ? d.game.player : undefined,
      lastUpdate: performance.now() + delayMs
    }

    if (isClockRunning) this.scheduleTick(this.times[d.game.player], delayMs)
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

  updateElement(color: Color, millis: Millis) {
    const el = this.elements[color]
    if (el) {
      const showTenths = this.showTenths(millis)
      const formatted = formatClockTime(millis, showTenths, this.times.activeColor === color)
      if (showTenths) {
        el.innerHTML = formatted
      } else {
        el.textContent = formatted
      }
      if (millis < this.emergMs) el.classList.add('emerg')
      else el.classList.remove('emerg')
    }
  }

  millisOf = (color: Color): Millis => (this.times.activeColor === color ?
     Math.max(0, this.times[color] - this.elapsed()) : this.times[color]
  )

  isRunning = () => this.times.activeColor !== undefined

  unload = () => {
    clearTimeout(this.tickTimeoutID)
    this.times.activeColor = undefined
  }

  private scheduleTick = (time: Millis, extraDelay: Millis) => {
    if (this.tickTimeoutID !== undefined) clearTimeout(this.tickTimeoutID)
    this.tickTimeoutID = setTimeout(
      this.tick,
      time % (this.showTenths(time) ? 100 : 500) + 1 + extraDelay)
  }

  // Should only be invoked by scheduleTick.
  private tick = (): void => {
    this.tickTimeoutID = undefined

    const color = this.times.activeColor
    if (!color) return

    const now = performance.now()
    const millis = Math.max(0, this.times[color] - this.elapsed(now))

    this.scheduleTick(millis, 0)
    if (millis === 0) this.opts.onFlag()
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

  private elapsed = (now = performance.now()) => Math.max(0, now - this.times.lastUpdate)
}
