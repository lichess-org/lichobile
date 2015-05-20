const scrollTolerance = 5;
const activeClass = 'active';

export default function ButtonHandler(el, tapHandler, holdHandler, scrollX, scrollY) {
  var startX, startY, boundaries, active;

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
      if (active) el.classList.add(activeClass);
    }, 200);
  }

  function onTouchMove(e) {
    // if going out of bounds, no way to reenable the button
    if (active) {
      var touch = e.changedTouches[0];
      active = isActive(touch);
      if (!active) el.classList.remove(activeClass);
    }
  }

  function onTouchEnd(e) {
    if (active) {
      el.classList.add(activeClass);
      tapHandler(e);
      active = false;
      setTimeout(() => el.classList.remove(activeClass), 80);
    }
  }

  function onTouchCancel() {
    active = false;
    el.classList.remove(activeClass);
  }

  function onHold(e) {
    e.preventDefault();
    e.stopPropagation();
    if (holdHandler) {
      holdHandler();
      active = false;
      el.classList.remove(activeClass);
    }
  }

  function isActive(touch) {
    var x = touch.clientX,
      y = touch.clientY,
      b = boundaries,
      d = 0;
    if (scrollX) d = Math.abs(x - startX);
    if (scrollY) d = Math.abs(y - startY);
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY && d < scrollTolerance;
  }

  el.addEventListener('touchstart', onTouchStart, false);
  el.addEventListener('touchmove', onTouchMove, false);
  el.addEventListener('touchend', onTouchEnd, false);
  el.addEventListener('touchcancel', onTouchCancel, false);
  el.addEventListener('contextmenu', onHold, false);

  return function unbind() {
    el.removeEventListener('touchstart', onTouchStart, false);
    el.removeEventListener('touchmove', onTouchMove, false);
    el.removeEventListener('touchend', onTouchEnd, false);
    el.removeEventListener('touchcancel', onTouchCancel, false);
    el.removeEventListener('contextmenu', onHold, false);
  };
}
