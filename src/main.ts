import { Plugins } from '@capacitor/core'

Plugins.SplashScreen.hide()
.then(() => {
  import('./app').then(({ default: app }) => {
    app()
  })
})
