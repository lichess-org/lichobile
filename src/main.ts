/// <reference path="dts/index.d.ts" />
import { Plugins, StatusBarStyle } from '@capacitor/core'

import appInit from './app'
import { getThemeFilename, getLocalFile, createStylesheetRule } from './bgtheme'
import { init as i18nInit } from './i18n'
import settings, { init as settingsInit } from './settings'

settingsInit()
.then(() => {
  const theme = settings.general.theme.background()

  Plugins.StatusBar.setStyle({
    style: theme === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
  })

  if (theme !== 'dark' && theme !== 'light') {
    getLocalFile(getThemeFilename(theme)).then(r => {
      createStylesheetRule(theme, r)
    })
  }
})
.then(i18nInit)
.then(() => Plugins.Device.getInfo())
.then(appInit)
.then(() => Plugins.SplashScreen.hide())
