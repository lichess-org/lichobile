import signals from '../../signals'
import * as helper from '../helper'
import oninit from './trainingCtrl'
import view from './trainingView'

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onremove() {
    signals.afterLogin.remove(this.retry)
    window.plugins.insomnia.allowSleepAgain()
  },
  view
}
