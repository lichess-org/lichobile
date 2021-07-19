import { SoundEffectPlugin } from 'capacitor-sound-effect'

declare module '@capacitor/core' {
  interface PluginRegistry {
    Badge: BadgePlugin
    CPUInfo: CPUInfoPlugin
    LiToast: LiToastPlugin
    SoundEffect: SoundEffectPlugin
  }
}

interface BadgePlugin {
  setNumber: (opts: {badge: number}) => Promise<void>
}

interface CPUInfoPlugin {
  nbCores: () => Promise<{value: number}>
}

type ToastOptions = {
  text: string
  duration?: 'short' | 'long'
  position?: 'top' | 'center' | 'bottom'
}

interface LiToastPlugin {
  show: (opts: ToastOptions) => Promise<void>
}
