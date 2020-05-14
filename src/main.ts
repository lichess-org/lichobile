/// <reference path="dts/index.d.ts" />
import { Plugins, StatusBarStyle } from '@capacitor/core'

import appInit from './app'
import { getFilenameFromKey, getLocalFile, createStylesheetRule } from './theme'
import { init as i18nInit } from './i18n'
import settings, { init as settingsInit } from './settings'

settingsInit()
.then(() => {
  const bgTheme = settings.general.theme.background()
  const boardTheme = settings.general.theme.board()

  Plugins.StatusBar.setStyle({
    style: bgTheme === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
  })


  // load background theme
  if (bgTheme !== 'dark' && bgTheme !== 'light') {
    const filename = getFilenameFromKey('bg', bgTheme)
    getLocalFile('bg', filename).then(r => {
      createStylesheetRule('bg', bgTheme, filename, r)
    })
    .catch(() => {
      settings.general.theme.background('dark')
    })
  }

  // load board theme
  if (!settings.general.theme.bundledBoardThemes.includes(boardTheme)) {
    const filename = getFilenameFromKey('board', boardTheme)
    getLocalFile('board', filename).then(r => {
      createStylesheetRule('board', boardTheme, filename, r)
    })
    .catch(() => {
      settings.general.theme.board('brown')
    })
  }
})
.then(i18nInit)
.then(() => Plugins.Device.getInfo())
.then(appInit)
.then(() => Plugins.SplashScreen.hide())
