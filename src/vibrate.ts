import settings from './settings'

let shouldVibrate: boolean = settings.general.vibrateOnGameEvents()

export default {
  quick() {
    if (shouldVibrate) window.navigator.vibrate(150)
  },
  onSettingChange(v: boolean) {
    shouldVibrate = v
  }
}
