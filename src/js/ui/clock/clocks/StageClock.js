import redraw from '../../../utils/redraw';
import sound from '../../../sound';
import * as h from 'mithril/hyperscript';
import * as stream from 'mithril/stream';

const CLOCK_TICK_STEP = 100;
const MINUTE_MILLIS = 60 * 1000;

export default function StageClock(stages, increment) {
  const topTime = stream(Number(stages[0].time) * MINUTE_MILLIS);
  const bottomTime = stream(Number(stages[0].time) * MINUTE_MILLIS);
  const topMoves = stream(Number(stages[0].moves));
  const bottomMoves = stream(Number(stages[0].moves));
  const topStage = stream(0);
  const bottomStage = stream(0);
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
        if (topMoves())
          topMoves(topMoves() - 1);
        topTime(topTime() + increment);
        if (topMoves() === 0) {
          topStage(topStage() + 1);
          topTime(topTime() + Number(stages[topStage()].time) * MINUTE_MILLIS);
          if (topStage() === (stages.length - 1))
            topMoves(null);
          else
            topMoves(stages[topStage()].moves);
        }
      }
      bottomTimestamp = performance.now();
      activeSide('bottom');
    }
    else {
      if (activeSide() === 'bottom') {
        if (bottomMoves())
          bottomMoves(bottomMoves() - 1);
        bottomTime(bottomTime() + increment);
        if (bottomMoves() === 0) {
          bottomStage(bottomStage() + 1);
          bottomTime(bottomTime() + Number(stages[bottomStage()].time) * MINUTE_MILLIS);
          if (bottomStage() === (stages.length - 1))
            bottomMoves(null);
          else
            bottomMoves(stages[bottomStage()].moves);
        }
      }
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
    startStop,
    topMoves,
    bottomMoves
  };
}
