import redraw from '../../../utils/redraw';
import sound from '../../../sound';
import * as h from 'mithril/hyperscript';
import * as stream from 'mithril/stream';

const CLOCK_TICK_STEP = 100;

export default function HandicapIncClock(topTimeParam, topIncrement, bottomTimeParam, bottomIncrement) {
  const topTime = (topTimeParam !== 0) ? stream(topTimeParam) : stream(topIncrement);
  const bottomTime = (bottomTimeParam !== 0) ? stream(bottomTimeParam) : stream(bottomIncrement);
  const activeSide = stream(null);
  const flagged = stream(null);
  const isRunning = stream(false);
  let clockInterval = null;
  let topTimestamp, bottomTimestamp;

  function tick () {
    const now = performance.now();
    if (activeSide() === 'top') {
      const elapsed = now - topTimestamp;
      topTimestamp = now;
      topTime(Math.max(topTime() - elapsed, 0));
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      const elapsed = now - bottomTimestamp;
      bottomTimestamp = now;
      bottomTime(Math.max(bottomTime() - elapsed, 0));
      if (bottomTime() <= 0) {
        flagged('bottom');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    redraw();
  }

  function clockHit (side) {
    if (flagged()) {
      return;
    }
    sound.clock();

    if (side === 'top') {
      if (activeSide() === 'top') {
        topTime(topTime() + topIncrement);
      }
      bottomTimestamp = performance.now();
      activeSide('bottom');
    } else if (side === 'bottom') {
      if (activeSide() === 'bottom') {
        bottomTime(bottomTime() + bottomIncrement);
      }
      topTimestamp = performance.now();
      activeSide('top');
    }
    clearInterval(clockInterval);
    clockInterval = setInterval(tick, CLOCK_TICK_STEP);
    isRunning(true);
    redraw();
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false);
      clearInterval(clockInterval);
    }
    else {
      isRunning(true);
      if (activeSide() === 'top') {
        topTimestamp = performance.now();
      } else {
        bottomTimestamp = performance.now();
      }
      clockInterval = setInterval(tick, CLOCK_TICK_STEP);
    }
  }

  return {
    topTime,
    bottomTime,
    activeSide,
    flagged,
    isRunning,
    tick,
    clockHit,
    startStop
  };
}
