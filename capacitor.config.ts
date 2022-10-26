/// <reference types="@capacitor/splash-screen" />
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.lichess.mobileapp',
  appName: 'lichess',
  bundledWebRuntime: false,
  webDir: 'www',
  backgroundColor: '000000ff',
  appendUserAgent: 'Lichobile/7.16.1',
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
    scheme: 'lichess',
  }
}

export default config

