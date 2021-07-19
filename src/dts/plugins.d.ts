import { SoundEffectPlugin } from 'capacitor-sound-effect'

declare module '@capacitor/core' {
  interface PluginRegistry {
    Badge: BadgePlugin
    CPUInfo: CPUInfoPlugin
    SoundEffect: SoundEffectPlugin
  }
}

interface BadgePlugin {
  setNumber: (opts: {badge: number}) => Promise<void>
}

interface CPUInfoPlugin {
  nbCores: () => Promise<{value: number}>
}
