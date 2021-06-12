import { Haptics } from '@capacitor/haptics'
import settings from './settings'

let shouldVibrate: boolean = settings.general.vibrateOnGameEvents()

export default {
  quick() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) window.navigator.vibrate(150)
      else Haptics.vibrate()
    }
  },
  onSettingChange(v: boolean) {
    shouldVibrate = v
  }
}
