import { INITIAL_FEN } from 'chessops/fen'
import Chessground from '~/chessground/Chessground'
import asyncStorage from '~/asyncStorage'
import settings from '~/settings'
import { randomColor } from '~/utils'
import redraw from '~/utils/redraw'

const FILES = 'abcdefgh'
const RANKS = '12345678'

const duration = 1000 * 30
const storeKey = 'coordinates'

interface Score {
  white?: { nb: number, avg: number }
  black?: { nb: number, avg: number }
}

export default class CoordCtrl {
  orientation: Color
  chessground: Chessground
  coords: Key[] = []
  wrongAnswer = false
  tempWrong = false
  score = 0
  progress= 100
  started = false

  constructor() {
    this.orientation = 'white'
    this.chessground = new Chessground({
      fen: INITIAL_FEN,
      orientation: this.orientation,
      coordinates: false,
      movable: {
        free: false,
        color: null,
      },
      events: {
        select: (key) => this.handleSelect(key),
      },
    })
  }

  public getOrientation(color: Color | 'random'): Color {
    return color === 'random' ? randomColor() : color as Color
  }

  private nextCoord(): Key {
    return (FILES[Math.round(Math.random() * (FILES.length - 1))] +
      RANKS[Math.round(Math.random() * (RANKS.length - 1))]) as Key
  }

  private pushCoords() {
    while (this.coords.length < 3) {
      const c = this.nextCoord()
      if (this.coords.indexOf(c) === -1) {
        this.coords.push(c)
      }
    }
  }

  public handleSelect(key: Key): void {
    if (key === this.coords[0]) {
      this.coords.shift()
      this.pushCoords()
      this.wrongAnswer = false
      this.tempWrong = false
      this.score++
    } else {
      this.wrongAnswer = true
      this.tempWrong = true
      setTimeout(() => {
        this.tempWrong = false
        redraw()
      }, 350)
    }
    redraw()
  }

  public startTraining(): void {
    if (!this.started) {
      this.started = true
      this.pushCoords()
      this.progress = 0
      this.score = 0
      this.wrongAnswer = false
      this.tempWrong = false
      this.orientation = this.getOrientation(settings.coordinates.colorChoice())

      this.chessground.set({
        orientation: this.orientation
      })

      const startedAt = performance.now()
      const frame = () => {
        const spent = Math.min(duration, performance.now() - startedAt)
        if (spent >= duration) {
          clearInterval(id)
          this.started = false
          this.coords = []
          // TODO save score
          redraw()
        } else {
          this.progress = (100 * spent) / duration
          redraw()
        }
      }
      const id = setInterval(frame, 50)
      redraw()
    }
  }

  private saveScore() {
    asyncStorage.get<Score>(storeKey).then(saved => {
      const score = saved || {}
      const nb = score[this.orientation].nb + 1
    })
  }
}
