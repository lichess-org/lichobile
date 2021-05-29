/// <reference path="dts/index.d.ts" />
import { Capacitor, Plugins } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Device } from '@capacitor/app'
import './webPlugins'

import appInit from './app'
import { init as settingsInit } from './settings'
import { init as i18nInit } from './i18n'
import { init as themeInit } from './theme'
import routes from './routes'
import { processWindowLocation } from './router'
import push from './push'
import deepLinks from './deepLinks'

interface XNavigator extends Navigator {
  hardwareConcurrency: number
}

settingsInit()
.then(() => Promise.all([
  App.getInfo(),
  Device.getInfo(),
  Device.getId(),
  Capacitor.getPlatform() === 'ios' ?
    Plugins.CPUInfo.nbCores().then((r: { value: number }) => r.value).catch(() => 1) :
    Promise.resolve((<XNavigator>navigator).hardwareConcurrency || 1),
  Plugins.StockfishVariants.getMaxMemory().then((r: { value: number }) => r.value).catch(() => 16),
  Capacitor.platform === 'android' ?
    Plugins.LiBuildConfig.get() : Promise.resolve({
      NNUE: false
    })
]))
.then(([ai, di, did, c, m, b]) => appInit(ai, di, did, c, m, b))
.then(() => {
  routes.init()
  deepLinks.init()
  push.init()
})
.then(themeInit)
.then(i18nInit)
.then(() => processWindowLocation())
.then(() => Plugins.SplashScreen.hide())
