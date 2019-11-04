import { ViewportDim } from '../../ui/helper'

/**
 * TinyGesture.js
 *
 * Adapted from https://github.com/sciactive/tinygesture
 */
type Handler = (e: TouchEvent) => void

interface Handlers {
  panstart: Handler[]
  panmove: Handler[]
  panend: Handler[]
  swipeleft: Handler[]
  swiperight: Handler[]
  swipeup: Handler[]
  swipedown: Handler[]
  [k: string]: Handler[]
}

export default class TinyGesture {
  private readonly handlers: Handlers = {
    panstart: [],
    panmove: [],
    panend: [],
    swipeleft: [],
    swiperight: [],
    swipeup: [],
    swipedown: [],
  }
  private opts: Options

  public touchStartX: number | null
  public touchStartY: number | null
  public touchEndX: number | null
  public touchEndY: number | null
  public velocityX: number
  public velocityY: number
  public touchMoveX: number
  public touchMoveY: number
  public swipingDirection: 'horizontal' | 'vertical' | 'pre-horizontal' | 'pre-vertical' | null = null

  private thresholdX: number = 0
  private thresholdY: number = 0

  constructor (
    readonly element: HTMLElement,
    readonly vd: ViewportDim,
    readonly options?: Partial<Options>
  ) {
    this.vd = vd
    this.element = element
    this.opts = Object.assign({}, defaults, options) as Options
    this.touchStartX = null
    this.touchStartY = null
    this.touchEndX = null
    this.touchEndY = null
    this.velocityX = 0
    this.velocityY = 0
    this.touchMoveX = 0
    this.touchMoveY = 0

    this.element.addEventListener('touchstart', this.onTouchStart, passive)
    this.element.addEventListener('touchmove', this.onTouchMove, this.opts.passiveMove ? passive : false)
    this.element.addEventListener('touchend', this.onTouchEnd, passive)
  }

  destroy () {
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.element.removeEventListener('touchmove', this.onTouchMove)
    this.element.removeEventListener('touchend', this.onTouchEnd)
  }

  on (type: string, fn: (e: TouchEvent) => void) {
    if (this.handlers[type]) {
      this.handlers[type].push(fn)
      return {
        type,
        fn,
        cancel: () => this.off(type, fn)
      }
    }
  }

  off (type: string, fn: (e: TouchEvent) => void) {
    if (this.handlers[type]) {
      const idx = this.handlers[type].indexOf(fn)
      if (idx !== -1) {
        this.handlers[type].splice(idx, 1)
      }
    }
  }

  private fire (type: string, event: TouchEvent) {
    for (let i = 0; i < this.handlers[type].length; i++) {
      this.handlers[type][i](event)
    }
  }

  private onTouchStart = (event: TouchEvent) => {
    this.thresholdX = this.opts.threshold('x', this)
    this.thresholdY = this.opts.threshold('y', this)
    this.touchStartX = event.changedTouches[0].pageX
    this.touchStartY = event.changedTouches[0].pageY
    this.touchMoveX = 0
    this.touchMoveY = 0
    this.touchEndX = null
    this.touchEndY = null
    this.fire('panstart', event)
  }

  private onTouchMove = (event: TouchEvent) => {
    const touchMoveX = event.changedTouches[0].pageX - this.touchStartX!
    this.velocityX = touchMoveX - this.touchMoveX
    this.touchMoveX = touchMoveX
    const touchMoveY = event.changedTouches[0].pageY - this.touchStartY!
    this.velocityY = touchMoveY - this.touchMoveY
    this.touchMoveY = touchMoveY
    const absTouchMoveX = Math.abs(this.touchMoveX)
    const absTouchMoveY = Math.abs(this.touchMoveY)
    const swipingHorizontal = absTouchMoveX > this.thresholdX
    const swipingVertical = absTouchMoveY > this.thresholdY
    this.swipingDirection = absTouchMoveX > absTouchMoveY
      ? (swipingHorizontal ? 'horizontal' : 'pre-horizontal')
      : (swipingVertical ? 'vertical' : 'pre-vertical')
    this.fire('panmove', event)
  }

  private onTouchEnd = (event: TouchEvent) => {
    this.touchEndX = event.changedTouches[0].pageX
    this.touchEndY = event.changedTouches[0].pageY
    this.fire('panend', event)

    const x = this.touchEndX - this.touchStartX!
    const absX = Math.abs(x)
    const y = this.touchEndY - this.touchStartY!
    const absY = Math.abs(y)

    if (absX > this.thresholdX || absY > this.thresholdY) {
      const swipedHorizontal = this.opts.diagonalSwipes ? Math.abs(x / y) <= this.opts.diagonalLimit : absX >= absY && absX > this.thresholdX
      const swipedVertical = this.opts.diagonalSwipes ? Math.abs(y / x) <= this.opts.diagonalLimit : absY > absX && absY > this.thresholdY
      if (swipedHorizontal) {
        if (x < 0) {
          // Left swipe.
          if (this.velocityX! < -this.opts.velocityThreshold) {
            this.fire('swipeleft', event)
          }
        } else {
          // Right swipe.
          if (this.velocityX! > this.opts.velocityThreshold) {
            this.fire('swiperight', event)
          }
        }
      }
      if (swipedVertical) {
        if (y < 0) {
          // Upward swipe.
          if (this.velocityY! < -this.opts.velocityThreshold) {
            this.fire('swipeup', event)
          }
        } else {
          // Downward swipe.
          if (this.velocityY! > this.opts.velocityThreshold) {
            this.fire('swipedown', event)
          }
        }
      }
    }
  }
}

interface Options {
  threshold: (t: string, s: TinyGesture) => number
  velocityThreshold: number
  passiveMove: boolean
  diagonalSwipes: boolean
  diagonalLimit: number
}

const defaults: Partial<Options> = {
  threshold: (type, self) => Math.max(25, Math.floor(0.15 * (type === 'x' ? self.vd.vw : self.vd.vh))),
  velocityThreshold: 10,
  passiveMove: true,
  diagonalSwipes: false,
  diagonalLimit: Math.tan(45 * 1.5 / 180 * Math.PI),
}

const passive = { passive: true }
