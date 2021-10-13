/// <reference types="@capacitor/splash-screen" />
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.lichess.mobileapp',
  appName: 'lichess',
  bundledWebRuntime: false,
  webDir: 'www',
  backgroundColor: '000000ff',
  appendUserAgent: 'Lichobile/7.13.0',
  plugins: {
    SplashScreen: {
      androidSplashResourceName: 'launch_splash',
      launchAutoHide: false,
      useDialog: false,
    },
    PushNotifications: {
      presentationOptions: ['sound', 'alert']
    }
  },
  ios: {
    includePlugins: [
      '@capacitor-community/keep-awake',
      '@capacitor/app',
      '@capacitor/browser',
      '@capacitor/clipboard',
      '@capacitor/device',
      '@capacitor/dialog',
      '@capacitor/filesystem',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/network',
      '@capacitor/push-notifications',
      '@capacitor/share',
      '@capacitor/splash-screen',
      '@capacitor/status-bar',
      '@capacitor/storage',
      '@capacitor/toast',
      'capacitor-sound-effect',
      'capacitor-stockfish-variants',
    ]
  },
}

export default config

