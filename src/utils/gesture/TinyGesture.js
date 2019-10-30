/**
 * TinyGesture.js
 *
 * Adapted from https://github.com/sciactive/tinygesture
 */
export default class TinyGesture {
  constructor (element, vd, options) {
    options = Object.assign({}, TinyGesture.defaults, options);
    this.vd = vd;
    this.element = element;
    this.opts = options;
    this.touchStartX = null;
    this.touchStartY = null;
    this.touchEndX = null;
    this.touchEndY = null;
    this.velocityX = null;
    this.velocityY = null;
    this.handlers = {
      'panstart': [],
      'panmove': [],
      'panend': [],
      'swipeleft': [],
      'swiperight': [],
      'swipeup': [],
      'swipedown': [],
    };

    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);

    this.element.addEventListener('touchstart', this._onTouchStart, passive);
    this.element.addEventListener('touchmove', this._onTouchMove, passive);
    this.element.addEventListener('touchend', this._onTouchEnd, passive);
  }

  destroy () {
    this.element.removeEventListener('touchstart', this._onTouchStart);
    this.element.removeEventListener('touchmove', this._onTouchMove);
    this.element.removeEventListener('touchend', this._onTouchEnd);
  }

  on (type, fn) {
    if (this.handlers[type]) {
      this.handlers[type].push(fn);
      return {
        type,
        fn,
        cancel: () => this.off(type, fn)
      };
    }
  }

  off (type, fn) {
    if (this.handlers[type]) {
      const idx = this.handlers[type].indexOf(fn);
      if (idx !== -1) {
        this.handlers[type].splice(idx, 1);
      }
    }
  }

  fire (type, event) {
    for (let i = 0; i < this.handlers[type].length; i++) {
      this.handlers[type][i](event);
    }
  }

  onTouchStart (event) {
    this.thresholdX = this.opts.threshold('x', this);
    this.thresholdY = this.opts.threshold('y', this);
    this.touchStartX = event.changedTouches[0].pageX;
    this.touchStartY = event.changedTouches[0].pageY;
    this.touchMoveX = null;
    this.touchMoveY = null;
    this.touchEndX = null;
    this.touchEndY = null;
    this.fire('panstart', event);
  }

  onTouchMove (event) {
    const touchMoveX = event.changedTouches[0].pageX - this.touchStartX;
    this.velocityX = touchMoveX - this.touchMoveX;
    this.touchMoveX = touchMoveX;
    const touchMoveY = event.changedTouches[0].pageY - this.touchStartY;
    this.velocityY = touchMoveY - this.touchMoveY;
    this.touchMoveY = touchMoveY;
    const absTouchMoveX = Math.abs(this.touchMoveX);
    const absTouchMoveY = Math.abs(this.touchMoveY);
    this.swipingHorizontal = absTouchMoveX > this.thresholdX;
    this.swipingVertical = absTouchMoveY > this.thresholdY;
    this.swipingDirection = absTouchMoveX > absTouchMoveY
      ? (this.swipingHorizontal ? 'horizontal' : 'pre-horizontal')
      : (this.swipingVertical ? 'vertical' : 'pre-vertical');
    this.fire('panmove', event);
  }

  onTouchEnd (event) {
    this.touchEndX = event.changedTouches[0].pageX;
    this.touchEndY = event.changedTouches[0].pageY;
    this.fire('panend', event);

    const x = this.touchEndX - this.touchStartX;
    const absX = Math.abs(x);
    const y = this.touchEndY - this.touchStartY;
    const absY = Math.abs(y);

    if (absX > this.thresholdX || absY > this.thresholdY) {
      this.swipedHorizontal = this.opts.diagonalSwipes ? Math.abs(x / y) <= this.opts.diagonalLimit : absX >= absY && absX > this.thresholdX;
      this.swipedVertical = this.opts.diagonalSwipes ? Math.abs(y / x) <= this.opts.diagonalLimit : absY > absX && absY > this.thresholdY;
      if (this.swipedHorizontal) {
        if (x < 0) {
          // Left swipe.
          if (this.velocityX < -this.opts.velocityThreshold) {
            this.fire('swipeleft', event);
          }
        } else {
          // Right swipe.
          if (this.velocityX > this.opts.velocityThreshold) {
            this.fire('swiperight', event);
          }
        }
      }
      if (this.swipedVertical) {
        if (y < 0) {
          // Upward swipe.
          if (this.velocityY < -this.opts.velocityThreshold) {
            this.fire('swipeup', event);
          }
        } else {
          // Downward swipe.
          if (this.velocityY > this.opts.velocityThreshold) {
            this.fire('swipedown', event);
          }
        }
      }
    }
  }
}

TinyGesture.defaults = {
  threshold: (type, self) => Math.max(25, Math.floor(0.15 * (type === 'x' ? self.vd.vw : self.vd.vh))),
  velocityThreshold: 10,
  diagonalSwipes: false,
  diagonalLimit: Math.tan(45 * 1.5 / 180 * Math.PI),
};

const passive = { passive: true };
