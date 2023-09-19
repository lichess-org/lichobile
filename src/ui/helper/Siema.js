// taken from https://github.com/pawelgrzybek/siema
// and adapted
import Zanimo from '../../utils/zanimo'

export default class Siema {
  /**
   * Create a Siema.
   * @param {Object} options - Optional settings object.
   */
  constructor(options) {
    // Merge defaults with user's settings
    this.config = Siema.mergeSettings(options)

    // Resolve selector's type
    this.selector = typeof this.config.selector === 'string' ? document.querySelector(this.config.selector) : this.config.selector

    // Early throw if selector or sliderframe don't exist
    if (this.selector === null || this.selector.firstElementChild === null) {
      throw new Error('Something wrong with your selector ??')
    }

    // update perPage number dependable of user value
    this.resolveSlidesNumber()

    // Create global references
    this.selectorWidth = this.selector.offsetWidth
    this.innerElements = [].slice.call(this.selector.firstElementChild.children)
    this.currentSlide =
      Math.max(0, Math.min(this.config.startIndex, this.innerElements.length - this.perPage))
    this.transformProperty = 'transform';

    // Bind all event handlers for referencability
    ['resizeHandler', 'touchstartHandler', 'touchendHandler', 'touchmoveHandler'].forEach(method => {
      this[method] = this[method].bind(this)
    })

    // Build markup and apply required styling to elements
    this.init()
  }


  /**
   * Overrides default settings with custom ones.
   * @param {Object} options - Optional settings object.
   * @returns {Object} - Custom Siema settings.
   */
  static mergeSettings(options) {
    const settings = {
      selector: '.siema',
      duration: 200,
      easing: 'ease-out',
      perPage: 1,
      startIndex: 0,
      draggable: true,
      // multipleDrag: true,
      threshold: 20,
      rtl: false,
      onInit: () => { /* noop */ },
      onChange: () => { /* noop */ },
    }

    const userSttings = options
    for (const attrname in userSttings) {
      settings[attrname] = userSttings[attrname]
    }

    return settings
  }

  /**
   * Attaches listeners to required events.
   */
  attachEvents() {
    // Resize element on window resize
    window.addEventListener('resize', this.resizeHandler)

    // If element is draggable / swipable, add event handlers
    if (this.config.draggable) {
      // Keep track pointer hold and dragging distance
      this.pointerDown = false
      this.drag = {
        startX: 0,
        endX: 0,
        startY: 0,
        letItGo: null,
        preventClick: false,
      }

      const passiveConf = { passive: true }

      // Touch events
      this.selector.addEventListener('touchstart', this.touchstartHandler, passiveConf)
      this.selector.addEventListener('touchend', this.touchendHandler, passiveConf)
      this.selector.addEventListener('touchmove', this.touchmoveHandler, passiveConf)

    }
  }


  /**
   * Detaches listeners from required events.
   */
  detachEvents() {
    window.removeEventListener('resize', this.resizeHandler)
    this.selector.removeEventListener('touchstart', this.touchstartHandler)
    this.selector.removeEventListener('touchend', this.touchendHandler)
    this.selector.removeEventListener('touchmove', this.touchmoveHandler)
  }


  /**
   * Builds the markup and attaches listeners to required events.
   */
  init() {
    this.attachEvents()

    // hide everything out of selector's boundaries
    this.selector.style.overflow = 'hidden'

    // rtl or ltr
    this.selector.style.direction = this.config.rtl ? 'rtl' : 'ltr'

    // build a frame and slide to a currentSlide
    this.buildSliderFrame()

    this.config.onInit.call(this)
  }


  /**
   * Build a sliderFrame and slide to a current item.
   */
  buildSliderFrame() {
    const widthItem = this.selectorWidth / this.perPage
    const itemsToBuild = this.innerElements.length

    // Get frame and apply styling
    this.sliderFrame = this.selector.firstElementChild
    this.sliderFrame.style.width = `${widthItem * itemsToBuild}px`

    for (let i = 0; i < this.innerElements.length; i++) {
      this.buildSliderFrameItem(this.innerElements[i])
    }

    // Go to currently active slide after initial build
    this.slideToCurrent()
  }

  buildSliderFrameItem(elementContainer) {
    elementContainer.style.cssFloat = this.config.rtl ? 'right' : 'left'
    elementContainer.style.float = this.config.rtl ? 'right' : 'left'
    elementContainer.style.width = `${100 / (this.innerElements.length)}%`
  }


  /**
   * Determinates slides number accordingly to clients viewport.
   */
  resolveSlidesNumber() {
    if (typeof this.config.perPage === 'number') {
      this.perPage = this.config.perPage
    }
    else if (typeof this.config.perPage === 'object') {
      this.perPage = 1
      for (const viewport in this.config.perPage) {
        if (window.innerWidth >= viewport) {
          this.perPage = this.config.perPage[viewport]
        }
      }
    }
  }


  /**
   * Go to previous slide.
   * @param {number} [howManySlides=1] - How many items to slide backward.
   * @param {function} callback - Optional callback function.
   */
  prev(howManySlides = 1) {
    // early return when there is nothing to slide
    if (this.innerElements.length <= this.perPage) {
      return
    }

    const beforeChange = this.currentSlide

    this.currentSlide = Math.max(this.currentSlide - howManySlides, 0)

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent()
      setTimeout(() => this.config.onChange(), 0)
    }
  }


  /**
   * Go to next slide.
   * @param {number} [howManySlides=1] - How many items to slide forward.
   * @param {function} callback - Optional callback function.
   */
  next(howManySlides = 1) {
    // early return when there is nothing to slide
    if (this.innerElements.length <= this.perPage) {
      return
    }

    const beforeChange = this.currentSlide

    this.currentSlide = Math.min(this.currentSlide + howManySlides, this.innerElements.length - this.perPage)
    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent()
      setTimeout(() => this.config.onChange(), 0)
    }
  }

  /**
   * Go to slide with particular index
   * @param {number} index - Item index to slide to.
   */
  goTo(index) {
    if (this.innerElements.length <= this.perPage) {
      return
    }
    const beforeChange = this.currentSlide
    this.currentSlide =
      Math.min(Math.max(index, 0), this.innerElements.length - this.perPage)
    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent()
      setTimeout(() => this.config.onChange(), 0)
    }
  }


  /**
   * Moves sliders frame to position of currently active slide
   */
  slideToCurrent() {
    const currentSlide = this.currentSlide
    const offset = (this.config.rtl ? 1 : -1) * currentSlide * (this.selectorWidth / this.perPage)

    Zanimo(
      this.sliderFrame,
      'transform',
      `translate3d(${offset}px, 0, 0)`,
      this.config.duration,
      this.config.easing
    )
  }


  /**
   * Recalculate drag /swipe event and reposition the frame of a slider
   */
  updateAfterDrag() {
    const movement = (this.config.rtl ? -1 : 1) * (this.drag.endX - this.drag.startX)
    const movementDistance = Math.abs(movement)
    // const howManySliderToSlide = this.config.multipleDrag ? Math.ceil(movementDistance / (this.selectorWidth / this.perPage)) : 1;
    const howManySliderToSlide = 1

    if (movement > 0 && movementDistance > this.config.threshold && this.innerElements.length > this.perPage && this.currentSlide - howManySliderToSlide >= 0) {
      this.prev(howManySliderToSlide)
    }
    else if (movement < 0 && movementDistance > this.config.threshold && this.innerElements.length > this.perPage && this.currentSlide + howManySliderToSlide <= this.innerElements.length - this.perPage) {
      this.next(howManySliderToSlide)
    } else {
      this.slideToCurrent()
    }
  }


  /**
   * When window resizes, resize slider components as well
   */
  resizeHandler() {
    // update perPage number dependable of user value
    this.resolveSlidesNumber()

    // relcalculate currentSlide
    // prevent hiding items when browser width increases
    if (this.currentSlide + this.perPage > this.innerElements.length) {
      this.currentSlide = this.innerElements.length <= this.perPage ? 0 : this.innerElements.length - this.perPage
    }

    this.selectorWidth = this.selector.offsetWidth

    this.buildSliderFrame()
  }


  /**
   * Clear drag after touchend and mouseup event
   */
  clearDrag() {
    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: null,
      preventClick: this.drag.preventClick
    }
  }


  /**
   * touchstart event handler
   */
  touchstartHandler(e) {
    // Prevent dragging / swiping on inputs, selects and textareas
    const ignoreSiema = ['TEXTAREA', 'OPTION', 'INPUT', 'SELECT'].indexOf(e.target.nodeName) !== -1
    if (ignoreSiema) {
      return
    }

    e.stopPropagation()
    this.pointerDown = true
    this.drag.startX = e.touches[0].pageX
    this.drag.startY = e.touches[0].pageY
  }


  /**
   * touchend event handler
   */
  touchendHandler(e) {
    e.stopPropagation()
    this.pointerDown = false
    if (this.drag.endX) {
      this.updateAfterDrag()
    }
    this.clearDrag()
  }


  /**
   * touchmove event handler
   */
  touchmoveHandler(e) {
    e.stopPropagation()

    if (this.drag.letItGo === null) {
      this.drag.letItGo = Math.abs(this.drag.startY - e.touches[0].pageY) < Math.abs(this.drag.startX - e.touches[0].pageX)
    }

    if (this.pointerDown && this.drag.letItGo) {
      this.drag.endX = e.touches[0].pageX

      const currentSlide = this.currentSlide
      const currentOffset = currentSlide * (this.selectorWidth / this.perPage)
      const dragOffset = (this.drag.endX - this.drag.startX)
      const offset = this.config.rtl ? currentOffset + dragOffset : currentOffset - dragOffset
      this.sliderFrame.style[this.transformProperty] = `translate3d(${(this.config.rtl ? 1 : -1) * offset}px, 0, 0)`
    }
  }

  /**
   * Remove item from carousel.
   * @param {number} index - Item index to remove.
   * @param {function} callback - Optional callback to call after remove.
   */
  remove(index, callback) {
    if (index < 0 || index >= this.innerElements.length) {
      throw new Error('Item to remove doesn\'t exist ??')
    }

    // Shift sliderFrame back by one item when:
    // 1. Item with lower index than currenSlide is removed.
    // 2. Last item is removed.
    const lowerIndex = index < this.currentSlide
    const lastItem = this.currentSlide + this.perPage - 1 === index

    if (lowerIndex || lastItem) {
      this.currentSlide--
    }

    this.innerElements.splice(index, 1)

    // build a frame and slide to a currentSlide
    this.buildSliderFrame()

    if (callback) {
      callback.call(this)
    }
  }


  /**
   * Insert item to carousel at particular index.
   * @param {HTMLElement} item - Item to insert.
   * @param {number} index - Index of new new item insertion.
   * @param {function} callback - Optional callback to call after insert.
   */
  insert(item, index, callback) {
    if (index < 0 || index > this.innerElements.length + 1) {
      throw new Error('Unable to inset it at this index ??')
    }
    if (this.innerElements.indexOf(item) !== -1) {
      throw new Error('The same item in a carousel? Really? Nope ??')
    }

    // Avoid shifting content
    const shouldItShift = index <= this.currentSlide > 0 && this.innerElements.length
    this.currentSlide = shouldItShift ? this.currentSlide + 1 : this.currentSlide

    this.innerElements.splice(index, 0, item)

    // build a frame and slide to a currentSlide
    this.buildSliderFrame()

    if (callback) {
      callback.call(this)
    }
  }


  /**
   * Prepernd item to carousel.
   * @param {HTMLElement} item - Item to prepend.
   * @param {function} callback - Optional callback to call after prepend.
   */
  prepend(item, callback) {
    this.insert(item, 0)
    if (callback) {
      callback.call(this)
    }
  }


  /**
   * Append item to carousel.
   * @param {HTMLElement} item - Item to append.
   * @param {function} callback - Optional callback to call after append.
   */
  append(item, callback) {
    this.insert(item, this.innerElements.length + 1)
    if (callback) {
      callback.call(this)
    }
  }


  /**
   * Removes listeners and optionally restores to initial markup
   * @param {boolean} restoreMarkup - Determinants about restoring an initial markup.
   * @param {function} callback - Optional callback function.
   */
  destroy(restoreMarkup = false, callback) {
    this.detachEvents()

    this.selector.style.cursor = 'auto'

    if (restoreMarkup) {
      for (let i = 0; i < this.innerElements.length; i++) {
        this.innerElements[i].removeAttribute('style')
      }
      if (this.sliderFrame) {
        this.sliderFrame.removeAttribute('style')
      }
      this.selector.removeAttribute('style')
    }

    if (callback) {
      callback.call(this)
    }
  }
}
