import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import settings from './settings'

let shouldVibrate: boolean = settings.general.vibrateOnGameEvents()

export default {
  quick() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(150)
      } else {
          void Haptics.vibrate()
      }
    }
  },
  tap() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50)
      } else {
        void Haptics.impact({ style: ImpactStyle.Medium })
      }
    }    
  },
  heavy() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100)
      } else {
        void Haptics.impact({ style: ImpactStyle.Heavy })
      }
    }    
  },    
  doubleTap() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50)
      } else {        
        void Haptics.impact({ style: ImpactStyle.Medium }).then(() => {
          void new Promise(r => setTimeout(r, 150)).then(() => {
            void Haptics.impact({ style: ImpactStyle.Medium })  
          })
        })
      }
    }    
  },
  warn() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50)
      } else {
        void Haptics.notification({ type: NotificationType.Warning })
      }
    }    
  },
  bad() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50)
      } else {
        void Haptics.notification({ type: NotificationType.Error })
      }
    }    
  },
  good() {
    if (shouldVibrate) {
      if (window.navigator.vibrate) {
          window.navigator.vibrate(50)
      } else {
        void Haptics.notification({ type: NotificationType.Success })
      }
    }    
  },
  onSettingChange(v: boolean) {
    shouldVibrate = v
  }
}
