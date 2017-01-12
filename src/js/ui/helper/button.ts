import { redrawSync } from '../../utils/redraw'
import { batchRequestAnimationFrame, removeFromBatchAnimationFrame } from '../../utils/batchRAF'

const HOLD_DURATION = 600;
const SCROLL_TOLERANCE = 8;
const ACTIVE_CLASS = 'active';

function hasContextMenu() {
  return window.cordova.platformId !== 'ios';
}

interface Boundaries {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export default function ButtonHandler(
  el: HTMLElement,
  tapHandler: (e?: Event) => void,
  holdHandler: () => void,
  repeatHandler: () => boolean,
  scrollX: boolean,
  scrollY: boolean,
  touchEndFeedback: boolean,
  getElement?: (e: TouchEvent) => HTMLElement) {

  let activeElement = el;

  let startX: number,
    startY: number,
    boundaries: Boundaries,
    active: boolean,
    holdTimeoutID: number,
    repeatTimeoutId: number;

  if (typeof tapHandler !== 'function')
    throw new Error('ButtonHandler 2nd argument must be a function!');

  if (holdHandler && typeof holdHandler !== 'function')
    throw new Error('ButtonHandler 3rd argument must be a function!');

  if (repeatHandler && typeof repeatHandler !== 'function')
    throw new Error('ButtonHandler 4rd argument must be a function!');

  // http://ejohn.org/blog/how-javascript-timers-work/
  function onRepeat() {
    const res = repeatHandler();
    if (res) batchRequestAnimationFrame(onRepeat);
    redrawSync();
  }

  function onTouchStart(e: TouchEvent) {
    let touch = e.changedTouches[0];
    activeElement  = getElement ? getElement(e) : el;
    if (!activeElement) return;
    let boundingRect = activeElement.getBoundingClientRect();
    startX = touch.clientX;
    startY = touch.clientY;
    boundaries = {
      minX: boundingRect.left,
      maxX: boundingRect.right,
      minY: boundingRect.top,
      maxY: boundingRect.bottom
    };
    active = true;
    setTimeout(() => {
      if (active) activeElement.classList.add(ACTIVE_CLASS);
    }, 200);
    if (!hasContextMenu()) holdTimeoutID = setTimeout(onHold, HOLD_DURATION);
    if (repeatHandler) repeatTimeoutId = setTimeout(() => {
      batchRequestAnimationFrame(onRepeat);
    }, 150);
  }

  function onTouchMove(e: TouchEvent) {
    // if going out of bounds, no way to reenable the button
    if (active && activeElement) {
      let touch = e.changedTouches[0];
      active = isActive(touch);
      if (!active) {
        clearTimeout(holdTimeoutID);
        clearTimeout(repeatTimeoutId);
        removeFromBatchAnimationFrame(onRepeat);
        activeElement.classList.remove(ACTIVE_CLASS);
      }
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    clearTimeout(repeatTimeoutId);
    removeFromBatchAnimationFrame(onRepeat);
    if (active && activeElement) {
      clearTimeout(holdTimeoutID);
      if (touchEndFeedback) activeElement.classList.add(ACTIVE_CLASS);
      tapHandler(e);
      active = false;
      setTimeout(() => activeElement.classList.remove(ACTIVE_CLASS), 80);
    }
  }

  function onTouchCancel() {
    clearTimeout(holdTimeoutID);
    clearTimeout(repeatTimeoutId);
    removeFromBatchAnimationFrame(onRepeat);
    active = false;
    if (activeElement) activeElement.classList.remove(ACTIVE_CLASS);
  }

  function onContextMenu(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (holdTimeoutID === undefined) onHold();
  }

  function onHold() {
    if (holdHandler) {
      holdHandler();
      active = false;
      if (activeElement) activeElement.classList.remove(ACTIVE_CLASS);
    }
  }

  function isActive(touch: Touch) {
    let x = touch.clientX,
      y = touch.clientY,
      b = boundaries,
      d = 0;
    if (scrollX) d = Math.abs(x - startX);
    if (scrollY) d = Math.abs(y - startY);
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY && d < SCROLL_TOLERANCE;
  }

  el.addEventListener('touchstart', onTouchStart, false);
  el.addEventListener('touchmove', onTouchMove, false);
  el.addEventListener('touchend', onTouchEnd, false);
  el.addEventListener('touchcancel', onTouchCancel, false);
  el.addEventListener('contextmenu', onContextMenu, false);
}

