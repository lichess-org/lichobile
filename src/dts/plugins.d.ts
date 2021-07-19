import { KeepAwakePlugin } from '@capacitor-community/keep-awake'

declare module '@capacitor/core' {
  interface PluginRegistry {
    Badge: BadgePlugin
    CPUInfo: CPUInfoPlugin
    KeepAwake: KeepAwakePlugin
    LiBuildConfig: LiBuildConfigPlugin
    LiShare: LiSharePlugin
    LiToast: LiToastPlugin
  }
}

interface BadgePlugin {
  setNumber: (opts: {badge: number}) => Promise<void>
}

interface CPUInfoPlugin {
  nbCores: () => Promise<{value: number}>
}

interface LiBuildConfigPlugin {
  get: () => Promise<BuildConfig>
}

type ShareOptions = ({url: string} | {text: string}) & {title?: string}

interface LiSharePlugin {
  share: (opts: ShareOptions) => Promise<void>
}

type ToastOptions = {
  text: string
  duration?: 'short' | 'long'
  position?: 'top' | 'center' | 'bottom'
}

interface LiToastPlugin {
  show: (opts: ToastOptions) => Promise<void>
}
