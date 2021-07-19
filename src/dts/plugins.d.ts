import { SoundEffectPlugin } from 'capacitor-sound-effect';

declare module '@capacitor/core' {
  interface PluginRegistry {
    Badge: BadgePlugin
    SoundEffect: SoundEffectPlugin
  }
}

interface BadgePlugin {
  setNumber: (opts: {badge: number}) => Promise<void>
}
