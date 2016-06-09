import * as utils from '../../utils';
import helper from '../helper';
import settings from '../../settings';
import m from 'mithril';
import clockSettings from './clockSettings';

export default function controller() {
  let clockMap = null;
  const isRunning = m.prop(false);
  const clockObj = m.prop();

  function reload() {
    clockMap = {
      'simple': simpleClock.bind(undefined, Number(settings.clock.simple.time()) * 60, m.redraw),
      'increment': incrementClock.bind(undefined, Number(settings.clock.increment.time()) * 60, Number(settings.clock.increment.increment()), m.redraw),
      'delay': delayClock.bind(undefined, Number(settings.clock.delay.time()) * 60, Number(settings.clock.delay.increment()), m.redraw),
      'bronstein': bronsteinClock.bind(undefined, Number(settings.clock.bronstein.time()) * 60, Number(settings.clock.bronstein.increment()), m.redraw),
      'hourglass': hourglassClock.bind(undefined, Number(settings.clock.hourglass.time()) * 60, m.redraw)
    };
    clockObj(clockMap[settings.clock.clockType()]());
  }

  reload();

  const clockSettingsCtrl = clockSettings.controller(reload);

  function clockTap (side) {
    clockObj().clockHit(side);
  }

  function startStop () {
    clockObj().startStop();
  }

  window.plugins.insomnia.keepAwake();

  return {
    isRunning,
    startStop,
    clockSettingsCtrl,
    clockObj,
    reload,
    clockTap,
    onunload: () => {
      window.plugins.insomnia.allowSleepAgain();
      window.StatusBar.show();
      if (clockObj().clockInterval) {
        clearInterval(clockObj().clockInterval);
      }
    }
  };
}


function simpleClock(time, draw) {
  return incrementClock(time, 0, draw);
}

function incrementClock(time, increment, draw) {
  const topTime = m.prop(time);
  const bottomTime = m.prop(time);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime()-1, 0));
      if (topTime() <= 0) {
        flagged('top');
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime()-1, 0));
      if (bottomTime() <= 0) {
        flagged('bottom');
      }
    }
    draw();
  }

  function clockHit (side) {
    if (activeSide() === 'top') {
      if (side === activeSide()) {
        activeSide('bottom');
        topTime(topTime() + increment);
      }
    }
    else if (activeSide() === 'bottom') {
      if (side === activeSide()) {
        activeSide('top');
        bottomTime(bottomTime() + increment);
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
    clockInterval = setInterval(tick, 1000);
    isRunning(true);
    draw();
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false);
      clearInterval(clockInterval);
    }
    else {
      isRunning(true);
      clockInterval = setInterval(tick, 1000);
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

function delayClock(time, increment, draw) {
  const topTime = m.prop(time);
  const bottomTime = m.prop(time);
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
        topTime(Math.max(topTime()-1, 0));
        if (topTime() <= 0) {
          flagged('top');
        }
      }
    }
    else if (activeSide() === 'bottom') {
      if (bottomDelay() > 0) {
        bottomDelay(bottomDelay() - 1);
      }
      else {
        bottomTime(Math.max(bottomTime()-1, 0));
        if (bottomTime() <= 0) {
          flagged('bottom');
        }
      }
    }
    draw();
  }

  function clockHit (side) {
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
    clockInterval = setInterval(tick, 1000);
    isRunning(true);
    draw();
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false);
      clearInterval(clockInterval);
    }
    else {
      isRunning(true);
      clockInterval = setInterval(tick, 1000);
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

function bronsteinClock(time, increment, draw) {
  const topTime = m.prop(time);
  const bottomTime = m.prop(time);
  const topDelay = m.prop(increment);
  const bottomDelay = m.prop(increment);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime()-1, 0));
      topDelay(Math.max(topDelay()-1, 0));
      if (topTime() <= 0) {
        flagged('top');
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime()-1, 0));
      bottomDelay(Math.max(bottomDelay()-1, 0));
      if (bottomTime() <= 0) {
        flagged('bottom');
      }
    }
    draw();
  }

  function clockHit (side) {
    if (activeSide() === 'top') {
      if (side === activeSide()) {
        activeSide('bottom');
        console.log(topDelay());
        topTime(topTime() + (increment - topDelay()));
        topDelay(increment);
      }
    }
    else if (activeSide() === 'bottom') {
      if (side === activeSide()) {
        activeSide('top');
        console.log(bottomDelay());
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
    clockInterval = setInterval(tick, 1000);
    isRunning(true);
    draw();
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false);
      clearInterval(clockInterval);
    }
    else {
      isRunning(true);
      clockInterval = setInterval(tick, 1000);
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

function hourglassClock(time, draw) {
  const topTime = m.prop(time/2);
  const bottomTime = m.prop(time/2);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime()-1, 0));
      bottomTime(time - topTime());
      if (topTime() <= 0) {
        flagged('top');
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime()-1, 0));
      topTime(time - bottomTime());
      if (bottomTime() <= 0) {
        flagged('bottom');
      }
    }
    draw();
  }

  function clockHit (side) {
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
    clockInterval = setInterval(tick, 1000);
    isRunning(true);
    draw();
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false);
      clearInterval(clockInterval);
    }
    else {
      isRunning(true);
      clockInterval = setInterval(tick, 1000);
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
