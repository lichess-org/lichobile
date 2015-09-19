const HOLD_DURATION = 600;
const SCROLL_TOLERANCE = 8;
const ACTIVE_CLASS = 'active';

function hasContextMenu() {
  return window.cordova.platformId !== 'ios';
}

export default function ButtonHandler(el, tapHandler, holdHandler, scrollX, scrollY, touchEndFeedback) {
  let startX, startY, boundaries, active, holdTimeoutID;

  if (typeof tapHandler !== 'function')
    throw new Error('ButtonHandler 2nd argument must be a function!');

  if (holdHandler && typeof holdHandler !== 'function')
    throw new Error('ButtonHandler 3rd argument must be a function!');

  function onTouchStart(e) {
    let touch = e.changedTouches[0];
    let boundingRect = el.getBoundingClientRect();
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
      if (active) el.classList.add(ACTIVE_CLASS);
    }, 200);
    if (!hasContextMenu()) holdTimeoutID = setTimeout(onHold, HOLD_DURATION);
  }

  function onTouchMove(e) {
    // if going out of bounds, no way to reenable the button
    if (active) {
      let touch = e.changedTouches[0];
      active = isActive(touch);
      if (!active) {
        clearTimeout(holdTimeoutID);
        el.classList.remove(ACTIVE_CLASS);
      }
    }
  }

  function onTouchEnd(e) {
    if (e.cancelable) e.preventDefault();
    if (active) {
      clearTimeout(holdTimeoutID);
      if (touchEndFeedback) el.classList.add(ACTIVE_CLASS);
      tapHandler(e);
      active = false;
      setTimeout(() => el.classList.remove(ACTIVE_CLASS), 80);
    }
  }

  function onTouchCancel() {
    clearTimeout(holdTimeoutID);
    active = false;
    el.classList.remove(ACTIVE_CLASS);
  }

  function onContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    if (holdTimeoutID === undefined) onHold();
  }

  function onHold() {
    if (holdHandler) {
      holdHandler();
      active = false;
      el.classList.remove(ACTIVE_CLASS);
    }
  }

  function isActive(touch) {
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

  return function unbind() {
    el.removeEventListener('touchstart', onTouchStart, false);
    el.removeEventListener('touchmove', onTouchMove, false);
    el.removeEventListener('touchend', onTouchEnd, false);
    el.removeEventListener('touchcancel', onTouchCancel, false);
    el.removeEventListener('contextmenu', onContextMenu, false);
  };
}
