import redraw from '../../../utils/redraw';
import sound from '../../../sound';
import * as m from 'mithril';

const CLOCK_TICK_STEP = 100;
const MINUTE_MILLIS = 60 * 1000;

export default function StageClock(stages, increment) {
  const topTime = m.prop(Number(stages[0].time) * MINUTE_MILLIS);
  const bottomTime = m.prop(Number(stages[0].time) * MINUTE_MILLIS);
  const topMoves = m.prop(0);
  const bottomMoves = m.prop(0);
  const topStage = m.prop(0);
  const bottomStage = m.prop(0);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
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
        topMoves(topMoves() + 1);
        topTime(topTime() + increment);
        if (topMoves() === Number(stages[topStage()].moves)) {
          topStage(topStage() + 1);
          topTime(topTime() + Number(stages[topStage()].time) * MINUTE_MILLIS);
          topMoves(0);
        }
      }
      bottomTimestamp = performance.now();
      activeSide('bottom');
    }
    else {
      if (activeSide() === 'bottom') {
        bottomMoves(bottomMoves() + 1);
        bottomTime(bottomTime() + increment);
        if (bottomMoves() === Number(stages[bottomStage()].moves)) {
          bottomStage(bottomStage() + 1);
          bottomTime(bottomTime() + Number(stages[bottomStage()].time) * MINUTE_MILLIS);
          bottomMoves(0);
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

  function topRemainingMoves() {
    if (stages[topStage()].moves) {
      return Number(stages[topStage()].moves) - topMoves();
    }
    else {
      return null;
    }
  }

  function bottomRemainingMoves() {
    if (stages[bottomStage()].moves) {
      return Number(stages[bottomStage()].moves) - bottomMoves();
    }
    else {
      return null;
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
    bottomMoves,
    topRemainingMoves,
    bottomRemainingMoves
  };
}
