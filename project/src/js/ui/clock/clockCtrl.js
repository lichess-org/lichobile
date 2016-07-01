import settings from '../../settings';
import sound from '../../sound';
import helper from '../helper';
import m from 'mithril';
import clockSettings from './clockSettings';

export default function controller() {

  helper.analyticsTrackView('Clock');

  let clockMap = null;
  const clockObj = m.prop();

  function reload() {
    if (clockObj() && clockObj().isRunning()) return;

    clockMap = {
      'simple': simpleClock.bind(undefined, Number(settings.clock.simple.time()) * 60),
      'increment': incrementClock.bind(undefined, Number(settings.clock.increment.time()) * 60, Number(settings.clock.increment.increment())),
      'delay': delayClock.bind(undefined, Number(settings.clock.delay.time()) * 60, Number(settings.clock.delay.increment())),
      'bronstein': bronsteinClock.bind(undefined, Number(settings.clock.bronstein.time()) * 60, Number(settings.clock.bronstein.increment())),
      'hourglass': hourglassClock.bind(undefined, Number(settings.clock.hourglass.time()) * 60),
      'stage': stageClock.bind(undefined, settings.clock.stage.stages(), Number(settings.clock.stage.increment()))
    };
    clockObj(clockMap[settings.clock.clockType()]());
  }

  reload();

  const clockSettingsCtrl = clockSettings.controller(reload, clockObj);

  function clockTap (side) {
    clockObj().clockHit(side);
  }

  function startStop () {
    clockObj().startStop();
  }

  function goHome() {
    if (!clockObj().isRunning()) {
      m.route('/');
    }
  }

  function hideStatusBar() {
    window.StatusBar.hide();
  }

  window.StatusBar.hide();

  if (window.cordova.platformId === 'android') {
    window.AndroidFullScreen.immersiveMode();
  }
  window.plugins.insomnia.keepAwake();
  document.addEventListener('resume', hideStatusBar);
  window.addEventListener('resize', hideStatusBar);

  return {
    startStop,
    clockSettingsCtrl,
    clockObj,
    reload,
    goHome,
    clockTap,
    onunload: () => {
      window.plugins.insomnia.allowSleepAgain();
      document.removeEventListener('resume', hideStatusBar);
      window.removeEventListener('resize', hideStatusBar);
      window.StatusBar.show();
      if (window.cordova.platformId === 'android') {
        window.AndroidFullScreen.showSystemUI();
      }
      if (clockObj().clockInterval) {
        clearInterval(clockObj().clockInterval);
      }
    }
  };
}

function simpleClock(time) {
  return incrementClock(time, 0);
}

function incrementClock(time, increment) {
  const topTime = (time !== 0) ? m.prop(time) : m.prop(increment);
  const bottomTime = (time !== 0) ? m.prop(time) : m.prop(increment);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime() - 1, 0));
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime() - 1, 0));
      if (bottomTime() <= 0) {
        flagged('bottom');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    m.redraw();
  }

  function clockHit (side) {
    if (flagged()) {
      return;
    }
    sound.clock();

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
    m.redraw();
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
        topTime(Math.max(topTime() - 1, 0));
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
        bottomTime(Math.max(bottomTime() - 1, 0));
        if (bottomTime() <= 0) {
          flagged('bottom');
          sound.dong();
          clearInterval(clockInterval);
        }
      }
    }
    m.redraw();
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
    clockInterval = setInterval(tick, 1000);
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
      topTime(Math.max(topTime() - 1, 0));
      topDelay(Math.max(topDelay() - 1, 0));
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime() - 1, 0));
      bottomDelay(Math.max(bottomDelay() - 1, 0));
      if (bottomTime() <= 0) {
        flagged('bottom');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    m.redraw();
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
    clockInterval = setInterval(tick, 1000);
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

function hourglassClock(time) {
  const topTime = m.prop(time/2);
  const bottomTime = m.prop(time/2);
  const activeSide = m.prop(null);
  const flagged = m.prop(null);
  const isRunning = m.prop(false);
  let clockInterval = null;

  function tick () {
    if (activeSide() === 'top') {
      topTime(Math.max(topTime() - 1, 0));
      bottomTime(time - topTime());
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime() - 1, 0));
      topTime(time - bottomTime());
      if (bottomTime() <= 0) {
        flagged('bottom');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    m.redraw();
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
    clockInterval = setInterval(tick, 1000);
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

function stageClock(stages, increment) {
  const topTime = m.prop(Number(stages[0].time) * 60);
  const bottomTime = m.prop(Number(stages[0].time) * 60);
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
      topTime(Math.max(topTime() - 1, 0));
      if (topTime() <= 0) {
        flagged('top');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    else if (activeSide() === 'bottom') {
      bottomTime(Math.max(bottomTime()- 1, 0));
      if (bottomTime() <= 0) {
        flagged('bottom');
        sound.dong();
        clearInterval(clockInterval);
      }
    }
    m.redraw();
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
          topTime(topTime() + Number(stages[topStage()].time) * 60);
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
          bottomTime(bottomTime() + Number(stages[bottomStage()].time) * 60);
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
    clockInterval = setInterval(tick, 1000);
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
      clockInterval = setInterval(tick, 1000);
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
