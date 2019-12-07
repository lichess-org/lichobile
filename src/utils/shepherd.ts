import settings from '../settings'
import { loadCss, loadScript } from '.'

export default function loadShepherd(): Promise<string> {
  const theme = settings.general.theme.background()
  const shepherdTheme = theme === 'light' ?
    'shepherd-theme-dark' : 'shepherd-theme-default'
  return loadCss(`vendor/shepherd/css/${shepherdTheme}.css`)
  .then(() => loadCss('vendor/shepherd/css/shepherd.css'))
  .then(() => loadScript('vendor/shepherd/js/tether.js'))
  .then(() => loadScript('vendor/shepherd/js/shepherd.min.js'))
  .then(() => shepherdTheme)
}
