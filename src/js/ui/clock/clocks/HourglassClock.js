import redraw from '../../../utils/redraw';
import sound from '../../../sound';
import * as h from 'mithril/hyperscript';
import * as stream from 'mithril/stream';

const CLOCK_TICK_STEP = 100;


export default function HourglassClock(time) {
  const topTime = stream(time/2);
  const bottomTime = stream(time/2);
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
      bottomTime(time - topTime());
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
      topTime(time - bottomTime());
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
      bottomTimestamp = performance.now();
      activeSide('bottom');
    }
    else {
      topTimestamp = performance.now();
      activeSide('top');
    }
    if (clockInterval) {
      clearInterval(clockInterval);
    }
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
      clockInterval = setInterval(tick, CLOCK_TICK_STEP);
      if (activeSide() === 'top') {
        topTimestamp = performance.now();
      } else {
        bottomTimestamp = performance.now();
      }
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
