/// <reference path="dts/index.d.ts" />
import { Plugins, StatusBarStyle } from '@capacitor/core'

import appInit from './app'
import { getThemeFilename, getLocalFile, createStylesheetRule } from './theme'
import { init as i18nInit } from './i18n'
import settings, { init as settingsInit } from './settings'

settingsInit()
.then(() => {
  const bgTheme = settings.general.theme.background()

  Plugins.StatusBar.setStyle({
    style: bgTheme === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
  })


  // load background theme
  if (bgTheme !== 'dark' && bgTheme !== 'light') {
    const filename = getThemeFilename('bg', bgTheme)
    getLocalFile('bg', filename).then(r => {
      createStylesheetRule('bg', bgTheme, filename, r)
    })
    .catch(() => {
      settings.general.theme.background('dark')
    })
  }

  // load board theme
})
.then(i18nInit)
.then(() => Plugins.Device.getInfo())
.then(appInit)
.then(() => Plugins.SplashScreen.hide())
