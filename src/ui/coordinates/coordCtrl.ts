import redraw from "~/utils/redraw"

const FILES = "abcdefgh"
const RANKS = "12345678"

export default class CoordCtrl {
  coords: Key[]
  wrongAnswer: boolean
  score: number
  progress: number
  started: "hidden" | "visible"

  constructor() {
    this.coords = []
    this.wrongAnswer = false
    this.score = 0
    this.progress = 100
    this.started = "visible"
  }

  getCoord(): Key {
    return (FILES[Math.round(Math.random() * (FILES.length - 1))] +
      RANKS[Math.round(Math.random() * (RANKS.length - 1))]) as Key
  }

  initCoords(coords: Key[] = []): Key[] {
    while (coords.length < 3) {
      const c = this.getCoord()
      if (coords.indexOf(c) === -1) {
        coords.push(c)
      }
    }
    return coords
  }

  handleSelect(key: Key): void {
    if (key === this.coords[0]) {
      this.coords.shift()
      this.initCoords(this.coords)
      this.wrongAnswer = false
      this.score++
    } else {
      this.wrongAnswer = true
      setTimeout(() => {
        this.wrongAnswer = false
        redraw()
      }, 350)
    }
    redraw()
  }

  startTraining(): void {
    this.started = "hidden"
    this.coords = this.initCoords()
    this.progress = 0
    this.score = 0
    this.wrongAnswer = false

    let width = 0
    const frame = () => {
      if (this.progress > 100) {
        clearInterval(id)
        this.started = "visible"
        this.coords = []
        redraw()
      } else {
        width++
        this.progress = width / 30
        redraw()
      }
    }
    const id = setInterval(frame, 10)
  }
}
