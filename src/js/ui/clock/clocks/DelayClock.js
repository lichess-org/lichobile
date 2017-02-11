import redraw from '../../../utils/redraw';
import sound from '../../../sound';
import * as h from 'mithril/hyperscript';
import * as stream from 'mithril/stream';

const CLOCK_TICK_STEP = 100;

export default function DelayClock(time, increment) {
  const topTime = (time !== 0) ? stream(time) : stream(increment);
  const bottomTime = (time !== 0) ? stream(time) : stream(increment);
  const topDelay = stream(increment);
  const bottomDelay = stream(increment);
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
      if (Math.floor(topDelay()) > 0) {
        topDelay(topDelay() - elapsed);
      } else {
        topTime(Math.max(topTime() - elapsed, 0));
        if (topTime() <= 0) {
          flagged('top');
          sound.dong();
          clearInterval(clockInterval);
        }
      }
    }
    else if (activeSide() === 'bottom') {
      const elapsed = now - bottomTimestamp;
      bottomTimestamp = now;
      if (bottomDelay() > 0) {
        bottomDelay(bottomDelay() - elapsed);
      } else {
        bottomTime(Math.max(bottomTime() - elapsed, 0));
        if (bottomTime() <= 0) {
          flagged('bottom');
          sound.dong();
          clearInterval(clockInterval);
        }
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
        topTime(topTime());
        topDelay(increment);
      }
      bottomTimestamp = performance.now();
      activeSide('bottom');
    } else if (side === 'bottom') {
      if (activeSide() === 'bottom') {
        bottomTime(bottomTime());
        bottomDelay(increment);
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

