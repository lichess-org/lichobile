import { Plugins, StatusBarStyle } from '@capacitor/core'
import settings from './settings'

Plugins.StatusBar.setStyle({
  style: settings.general.theme.background() === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
})

Plugins.SplashScreen.hide()

import('./app').then(({ default: app }) => {
  app()
})
