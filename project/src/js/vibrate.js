import settings from './settings';

var shouldVibrate;

document.addEventListener('deviceready', function() {
  shouldVibrate = settings.general.vibrateOnGameEvents();
});

export default {
  quick() {
    if (shouldVibrate) window.navigator.vibrate(150);
  },
  onSettingChange(v) {
    shouldVibrate = v;
  }
};
