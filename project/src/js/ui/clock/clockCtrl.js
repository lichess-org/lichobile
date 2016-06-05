import * as utils from '../../utils';
import helper from '../helper';
import settings from '../../settings';
import m from 'mithril';
import clockSettings from './clockSettings';

export default function controller() {
  let clockInterval = null;
  let clockMap = null;
  const isRunning = m.prop();
  const clockObj = m.prop();

  function reload() {
    clockMap = {
      'simple': simpleClock.bind(undefined, settings.clock.simple.time()),
      'increment': incrementClock.bind(undefined, settings.clock.increment.time(), settings.clock.increment.increment()),
      'delay': delayClock.bind(undefined, settings.clock.delay.time(), settings.clock.delay.increment())
    };
    isRunning(false);
    console.log(clockMap[settings.clock.clockType()]());
    clockObj(clockMap[settings.clock.clockType()]());
  }

  reload();

  const clcokSettingsCtrl = clockSettings.controller();

  function clockTap (side) {
    isRunning(true);
    clockObj().clockHit(side);
    clockInterval = setInterval(clockObj().tick, 1000);
  }

  function startStop () {
    isRunning(!isRunning());
  }

  window.plugins.insomnia.keepAwake();

  return {
    isRunning,
    startStop,
    clcokSettingsCtrl,
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
  let topTime = time;
  let bottomTime = time;
  let activeSide = null;

  function tick () {
    if (activeSide === 'top') {
      topTime--;
    }
    else if (activeSide === 'bottom') {
      bottomTime--;
    }
  }

  function isFlagged () {
    if (topTime <= 0) {
      return 'top';
    }
    else if (bottomTime <= 0) {
      return 'bottom';
    }
    return null;
  }

  function clockHit (side) {
    if (activeSide === 'top') {
      if (side === activeSide) {
        activeSide = 'bottom';
      }
    }
    else if (activeSide === 'bottom') {
      if (side === activeSide) {
        activeSide = 'top';
      }
    }
    else {
      if (side === 'top') {
        activeSide = 'bottom';
      }
      else {
        activeSide = 'top';
      }
    }
  }

  return {
    topTime: topTime,
    bottomTime: bottomTime,
    activeSide: activeSide,
    tick: tick,
    isFlagged: isFlagged,
    clockHit: clockHit
  };
}

function incrementClock() {

}

function delayClock() {

}
