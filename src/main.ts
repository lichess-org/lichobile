import { Plugins, StatusBarStyle } from '@capacitor/core'
import settings from './settings'
import { getThemeFilename, getLocalFile, createStylesheetRule } from './bgtheme'
import app from './app'

const theme = settings.general.theme.background()

Plugins.StatusBar.setStyle({
  style: theme === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
})

if (theme !== 'dark' && theme !== 'light') {
  getLocalFile(getThemeFilename(theme)).then(r => {
    createStylesheetRule(theme, r)
  })
}

Plugins.SplashScreen.hide()

app()
