/// <reference path="dts/index.d.ts" />
import { Plugins } from '@capacitor/core'

import appInit from './app'
import { init as settingsInit } from './settings'
import { init as i18nInit } from './i18n'
import { init as themeInit } from './theme'
import routes from './routes'
import push from './push'
import deepLinks from './deepLinks'

settingsInit()
.then(() => {
  routes.init()
  deepLinks.init()
  push.init()
})
.then(themeInit)
.then(i18nInit)
.then(() => Plugins.Device.getInfo())
.then(appInit)
.then(() => Plugins.SplashScreen.hide())
