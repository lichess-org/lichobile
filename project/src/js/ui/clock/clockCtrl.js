import * as utils from '../../utils';
import helper from '../helper';
import settings from '../../settings';
import m from 'mithril';
import clockSettings from './clockSettings';

export default function controller() {
  let clockInterval = null;
  let clockMap = null;
  const isRunning = m.prop(false);
  const clockObj = m.prop();

  function reload() {
    clockMap = {
      'simple': simpleClock.bind(undefined, Number(settings.clock.simple.time()) * 60),
      'increment': incrementClock.bind(undefined, Number(settings.clock.increment.time()) * 60, Number(settings.clock.increment.increment())),
      'delay': delayClock.bind(undefined, Number(settings.clock.delay.time()) * 60, Number(settings.clock.delay.increment()))
    };
    isRunning(false);
    clockObj(clockMap[settings.clock.clockType()]());
  }

  reload();

  const clockSettingsCtrl = clockSettings.controller(reload);

  function clockTap (side) {
    clockObj().clockHit(side);
    if (clockInterval) {
      clearInterval(clockInterval);
    }
    clockInterval = setInterval(clockObj().tick, 1000);
    isRunning(true);
    m.redraw();
  }

  function startStop () {
    if (isRunning()) {
      isRunning(false);
      clearInterval(clockInterval);
    }
    else {
      isRunning(true);
      clockInterval = setInterval(clockObj().tick, 1000);
    }
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
      if (clockInterval) {
        clearInterval(clockInterval);
      }
    }
  };
}


function simpleClock(time) {
  return incrementClock(time, 0);
}

function incrementClock(time, increment) {
  const topTime = m.prop(time);
  const bottomTime = m.prop(time);
  const activeSide = m.prop(null);

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime()-1, 0));
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime()-1, 0));
    }
    m.redraw();
  }

  function flagged () {
    if (topTime() <= 0) {
      return 'top';
    }
    else if (bottomTime() <= 0) {
      return 'bottom';
    }
    return null;
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
  }

  return {
    topTime,
    bottomTime,
    activeSide,
    tick,
    flagged,
    clockHit
  };
}

function delayClock(time, increment) {
  const topTime = m.prop(time);
  const bottomTime = m.prop(time);
  const activeSide = m.prop(null);

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime()-1, 0));
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime()-1, 0));
    }
    m.redraw();
  }

  function flagged () {
    if (topTime() <= 0) {
      return 'top';
    }
    else if (bottomTime() <= 0) {
      return 'bottom';
    }
    return null;
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
  }

  return {
    topTime,
    bottomTime,
    activeSide,
    tick,
    flagged,
    clockHit
  };
}
