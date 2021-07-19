import { SoundEffectPlugin } from 'capacitor-sound-effect';

declare module '@capacitor/core' {
  interface PluginRegistry {
    SoundEffect: SoundEffectPlugin
  }
}
