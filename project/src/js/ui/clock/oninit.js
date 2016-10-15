import router from '../../router';
import settings from '../../settings';
import * as helper from '../helper';
import * as m from 'mithril';
import clockSettings from './clockSettings';
import clockSet from './clockSet';

export default function oninit(vnode) {

  helper.analyticsTrackView('Clock');

  const clockObj = m.prop();
  const clockType = m.prop();

  function reload() {
    if (clockObj() && clockObj().isRunning() && !clockObj().flagged()) return;
    clockType(settings.clock.clockType());
    clockObj(clockSet[settings.clock.clockType()]());
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
    if (!clockObj().isRunning() || clockObj().flagged()) {
      router.set('/');
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

  vnode.state = {
    hideStatusBar,
    startStop,
    clockSettingsCtrl,
    clockObj,
    reload,
    goHome,
    clockTap,
    clockType
  };
}
