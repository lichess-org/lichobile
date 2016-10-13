import redraw from '../../utils/redraw';
import settings from '../../settings';
import sound from '../../sound';
import * as m from 'mithril';

const MILLIS = 1000;
const MINUTE_MILLIS = 60 * 1000;
const CLOCK_TICK_STEP = 100;

export const clockMap = {
  simple: () => simpleClock(
    Number(settings.clock.simple.time()) * MINUTE_MILLIS
  ),

  increment: () => incrementClock(
    Number(settings.clock.increment.time()) * MINUTE_MILLIS,
    Number(settings.clock.increment.increment()) * MILLIS
  ),

  handicapInc: () => handicapIncClock(
    Number(settings.clock.handicapInc.topTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.topIncrement()) * MILLIS,
    Number(settings.clock.handicapInc.bottomTime()) * MINUTE_MILLIS,
    Number(settings.clock.handicapInc.bottomIncrement()) * MILLIS
  ),

  delay: () => delayClock(
    Number(settings.clock.delay.time()) * MINUTE_MILLIS,
    Number(settings.clock.delay.increment()) * MILLIS
  ),

  bronstein: () => bronsteinClock(
    Number(settings.clock.bronstein.time()) * MINUTE_MILLIS,
    Number(settings.clock.bronstein.increment()) * MILLIS
  ),

  hourglass: () => hourglassClock(
    Number(settings.clock.hourglass.time()) * MINUTE_MILLIS
  ),

  stage: () => stageClock(
    settings.clock.stage.stages(),
    Number(settings.clock.stage.increment()) * MILLIS
  )
};

function simpleClock(time) {
  return incrementClock(time, 0);
}

function incrementClock(time, increment) {
  return handicapIncClock(time, increment, time, increment);
}

function handicapIncClock(topTimeParam, topIncrement, bottomTimeParam, bottomIncrement) {
  const topTime = (topTimeParam !== 0) ? m.prop(topTimeParam) : m.prop(topIncrement);
  const bottomTime = (bottomTimeParam !== 0) ? m.prop(bottomTimeParam) : m.prop(bottomIncrement);
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
      clockInterval = setInterval(tick, CLOCK_TICK_STEP);
      if (!activeSide()) {
        activeSide('top');
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

function delayClock(time, increment) {
  const topTime = (time !== 0) ? m.prop(time) : m.prop(increment);
  const bottomTime = (time !== 0) ? m.prop(time) : m.prop(increment);
  const topDelay = m.prop(increment);
  const bottomDelay = m.prop(increment);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      if (topDelay() > 0) {
        topDelay(topDelay() - 1);
      }
      else {
        topTime(Math.max(topTime() - CLOCK_TICK_STEP, 0));
        if (topTime() <= 0) {
          flagged('top');
          sound.dong();
          clearInterval(clockInterval);
        }
      }
    }
    else if (activeSide() === 'bottom') {
      if (bottomDelay() > 0) {
        bottomDelay(bottomDelay() - 1);
      }
      else {
        bottomTime(Math.max(bottomTime() - CLOCK_TICK_STEP, 0));
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

    if (activeSide() === 'top') {
      if (side === activeSide()) {
        activeSide('bottom');
        topDelay(increment);
      }
    }
    else if (activeSide() === 'bottom') {
      if (side === activeSide()) {
        activeSide('top');
        bottomDelay(increment);
      }
    }
    else {
      if (side === 'top') {
        activeSide('bottom');
      }
      else {
        activeSide('top');
      }
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
      if (!activeSide()) {
        activeSide('top');
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

function bronsteinClock(time, increment) {
  const topTime = (time !== 0) ? m.prop(time) : m.prop(increment);
  const bottomTime = (time !== 0) ? m.prop(time) : m.prop(increment);
  const topDelay = m.prop(increment);
  const bottomDelay = m.prop(increment);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime() - CLOCK_TICK_STEP, 0));
      topDelay(Math.max(topDelay() - CLOCK_TICK_STEP, 0));
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime() - CLOCK_TICK_STEP, 0));
      bottomDelay(Math.max(bottomDelay() - CLOCK_TICK_STEP, 0));
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

    if (activeSide() === 'top') {
      if (side === activeSide()) {
        activeSide('bottom');
        topTime(topTime() + (increment - topDelay()));
        topDelay(increment);
      }
    }
    else if (activeSide() === 'bottom') {
      if (side === activeSide()) {
        activeSide('top');
        bottomTime(bottomTime() + (increment - bottomDelay()));
        bottomDelay(increment);
      }
    }
    else {
      if (side === 'top') {
        activeSide('bottom');
      }
      else {
        activeSide('top');
      }
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
      if (!activeSide()) {
        activeSide('top');
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

function hourglassClock(time) {
  const topTime = m.prop(time/2);
  const bottomTime = m.prop(time/2);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime() - CLOCK_TICK_STEP, 0));
      bottomTime(time - topTime());
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime() - CLOCK_TICK_STEP, 0));
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

    if (activeSide() === 'top') {
      if (side === activeSide()) {
        activeSide('bottom');
      }
    }
    else if (activeSide() === 'bottom') {
      if (side === activeSide()) {
        activeSide('top');
      }
    }
    else {
      if (side === 'top') {
        activeSide('bottom');
      }
      else {
        activeSide('top');
      }
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
      if (!activeSide()) {
        activeSide('top');
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

function stageClock(stages, increment) {
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

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime() - CLOCK_TICK_STEP, 0));
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime() - CLOCK_TICK_STEP, 0));
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

    if (activeSide() === 'top') {
      if (side === activeSide()) {
        topMoves(topMoves() + 1);
        topTime(topTime() + increment);
        if (topMoves() === Number(stages[topStage()].moves)) {
          topStage(topStage() + 1);
          topTime(topTime() + Number(stages[topStage()].time) * MINUTE_MILLIS);
          topMoves(0);
        }
        activeSide('bottom');
      }
    }
    else if (activeSide() === 'bottom') {
      if (side === activeSide()) {
        bottomMoves(bottomMoves() + 1);
        bottomTime(bottomTime() + increment);
        if (bottomMoves() === Number(stages[bottomStage()].moves)) {
          bottomStage(bottomStage() + 1);
          bottomTime(bottomTime() + Number(stages[bottomStage()].time) * MINUTE_MILLIS);
          bottomMoves(0);
        }
        activeSide('top');
      }
    }
    else {
      if (side === 'top') {
        activeSide('bottom');
      }
      else {
        activeSide('top');
      }
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
      if (!activeSide()) {
        activeSide('top');
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
