import { ViewportDim } from '../ui/helper'

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

/**
 * Adapted from https://github.com/sciactive/tinygesture
 */
export default class Gesture {
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

  private swipeThresholdX: number
  private swipeThresholdY: number
  private startInputTimestamp = 0

  constructor (
    readonly element: HTMLElement,
    readonly vd: ViewportDim,
    readonly options?: Partial<Options>
  ) {
    this.swipeThresholdX = threshold('x', vd)
    this.swipeThresholdY = threshold('y', vd)
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
    if (event.changedTouches.length > 1) return
    this.touchStartX = event.changedTouches[0].pageX
    this.touchStartY = event.changedTouches[0].pageY
    this.velocityX = 0
    this.velocityY = 0
    this.touchMoveX = 0
    this.touchMoveY = 0
    this.touchEndX = null
    this.touchEndY = null
    this.startInputTimestamp = performance.now()
    this.fire('panstart', event)
  }

  private onTouchMove = (event: TouchEvent) => {
    if (event.changedTouches.length > 1) return
    this.touchMoveX = event.changedTouches[0].pageX - this.touchStartX!
    const deltaTime = performance.now() - this.startInputTimestamp
    this.velocityX = this.touchMoveX / deltaTime
    this.touchMoveY = event.changedTouches[0].pageY - this.touchStartY!
    this.velocityY = this.touchMoveY / deltaTime
    const absTouchMoveX = Math.abs(this.touchMoveX)
    const absTouchMoveY = Math.abs(this.touchMoveY)
    const swipingHorizontal = absTouchMoveX > this.swipeThresholdX
    const swipingVertical = absTouchMoveY > this.swipeThresholdY
    this.swipingDirection = absTouchMoveX > absTouchMoveY
      ? (swipingHorizontal ? 'horizontal' : 'pre-horizontal')
      : (swipingVertical ? 'vertical' : 'pre-vertical')
    this.fire('panmove', event)
  }

  private onTouchEnd = (event: TouchEvent) => {
    if (event.changedTouches.length > 1) return
    this.touchEndX = event.changedTouches[0].pageX
    this.touchEndY = event.changedTouches[0].pageY
    this.fire('panend', event)

    const x = this.touchEndX - this.touchStartX!
    const absX = Math.abs(x)
    const y = this.touchEndY - this.touchStartY!
    const absY = Math.abs(y)

    if (absX > this.swipeThresholdX || absY > this.swipeThresholdY) {
      const swipedHorizontal = absX >= absY && absX > this.swipeThresholdX
      const swipedVertical = absY > absX && absY > this.swipeThresholdY
      if (swipedHorizontal) {
        if (x < 0) {
          if (this.velocityX < -this.opts.swipeVelocityThreshold) {
            this.fire('swipeleft', event)
          }
        } else {
          if (this.velocityX > this.opts.swipeVelocityThreshold) {
            this.fire('swiperight', event)
          }
        }
      }
      if (swipedVertical) {
        if (y < 0) {
          if (this.velocityY < -this.opts.swipeVelocityThreshold) {
            this.fire('swipeup', event)
          }
        } else {
          if (this.velocityY > this.opts.swipeVelocityThreshold) {
            this.fire('swipedown', event)
          }
        }
      }
    }
  }
}

function threshold(t: string, vd: ViewportDim) {
  return Math.max(25, Math.floor(0.15 * (t === 'x' ? vd.vw : vd.vh)))
}

interface Options {
  swipeVelocityThreshold: number
  passiveMove: boolean
}

const defaults: Partial<Options> = {
  swipeVelocityThreshold: 0.4,
  passiveMove: true,
}

const passive = { passive: true }
