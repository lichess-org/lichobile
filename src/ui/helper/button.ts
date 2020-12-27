import { redrawSync } from '../../utils/redraw'
import { batchRequestAnimationFrame, removeFromBatchAnimationFrame } from '../../utils/batchRAF'

const HOLD_DURATION = 600
const SCROLL_TOLERANCE_X = 4
const SCROLL_TOLERANCE_Y = 4
const ACTIVE_CLASS = 'active'

interface Boundaries {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export default function ButtonHandler(
  el: HTMLElement,
  tapHandler: (e: TouchEvent) => void,
  holdHandler?: (e: TouchEvent) => void,
  repeatHandler?: () => boolean,
  scrollX?: boolean,
  scrollY?: boolean,
  getElement?: (e: TouchEvent) => HTMLElement | null,
  preventEndDefault = true,
) {

  let activeElement: HTMLElement | null = el

  let startX: number,
    startY: number,
    boundaries: Boundaries,
    active: boolean,
    holdTimeoutID: number,
    repeatTimeoutId: number,
    activeTimeoutId: number

  if (typeof tapHandler !== 'function')
    throw new Error('ButtonHandler 2nd argument must be a function!')

  if (holdHandler && typeof holdHandler !== 'function')
    throw new Error('ButtonHandler 3rd argument must be a function!')

  if (repeatHandler && typeof repeatHandler !== 'function')
    throw new Error('ButtonHandler 4rd argument must be a function!')

  // http://ejohn.org/blog/how-javascript-timers-work/
  function onRepeat() {
    const res = repeatHandler!()
    if (res) batchRequestAnimationFrame(onRepeat)
    redrawSync()
  }

  function onTouchStart(e: TouchEvent) {
    const touch = e.changedTouches[0]
    activeElement  = getElement ? getElement(e) : el
    if (!activeElement) return
    if ((activeElement as HTMLButtonElement).disabled === true) return
    const boundingRect = activeElement.getBoundingClientRect()
    startX = touch.clientX
    startY = touch.clientY
    boundaries = {
      minX: boundingRect.left,
      maxX: boundingRect.right,
      minY: boundingRect.top,
      maxY: boundingRect.bottom
    }
    active = true
    clearTimeout(activeTimeoutId)
    // for ios: need to set it bc/ :active doesn't reset when moving away
    activeElement.classList.add(ACTIVE_CLASS)
    holdTimeoutID = setTimeout(() => onHold(e), HOLD_DURATION)
    if (repeatHandler) repeatTimeoutId = setTimeout(() => {
      batchRequestAnimationFrame(onRepeat)
    }, 150)
  }

  function onTouchMove(e: TouchEvent) {
    // if going out of bounds, no way to reenable the button
    if (active && activeElement) {
      const touch = e.changedTouches[0]
      active = isActive(touch)
      if (!active) {
        clearTimeout(holdTimeoutID)
        clearTimeout(repeatTimeoutId)
        removeFromBatchAnimationFrame(onRepeat)
        activeElement.classList.remove(ACTIVE_CLASS)
      }
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.cancelable && preventEndDefault) e.preventDefault()
    clearTimeout(repeatTimeoutId)
    removeFromBatchAnimationFrame(onRepeat)
    if (active && activeElement) {
      clearTimeout(holdTimeoutID)
      activeTimeoutId = setTimeout(() => activeElement && activeElement.classList.remove(ACTIVE_CLASS), 80)
      tapHandler(e)
      active = false
    }
  }

  function onTouchCancel() {
    clearTimeout(holdTimeoutID)
    clearTimeout(repeatTimeoutId)
    removeFromBatchAnimationFrame(onRepeat)
    active = false
    if (activeElement) {
      activeElement.classList.remove(ACTIVE_CLASS)
    }
  }

  // typescript doesn't like TouchEvent here
  function onContextMenu(e: Event) {
    // just disable it since we handle manually holdHandler
    // because contextmenu does not work in iOS and chrome dev tools
    // (it fires a MouseEvent in the latter)
    e.preventDefault()
    e.stopPropagation()
  }

  function onHold(e: TouchEvent) {
    if (holdHandler) {
      holdHandler(e)
      active = false
      if (activeElement) {
        activeElement.classList.remove(ACTIVE_CLASS)
      }
    }
  }

  function isActive(touch: Touch) {
     const x = touch.clientX,
      y = touch.clientY,
      b = boundaries;
    let dX = 0,
      dY = 0
    if (scrollX) dX = Math.abs(x - startX)
    if (scrollY) dY = Math.abs(y - startY)
    return (
      x < b.maxX &&
      x > b.minX &&
      y < b.maxY &&
      y > b.minY &&
      dX < SCROLL_TOLERANCE_X &&
      dY < SCROLL_TOLERANCE_Y
    )
  }

  const passiveConf: any = { passive: true }

  el.addEventListener('touchstart', onTouchStart, passiveConf)
  el.addEventListener('touchmove', onTouchMove, passiveConf)
  el.addEventListener('touchend', onTouchEnd, false)
  el.addEventListener('touchcancel', onTouchCancel, false)
  el.addEventListener('contextmenu', onContextMenu, false)
}

