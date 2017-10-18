import signals from '../../signals'
import * as helper from '../helper'
import view from './trainingView'

import TrainingCtrl from './TrainingCtrl'

interface Attrs {
  id: string
}

interface State {
  ctrl: TrainingCtrl
}

export default {
  oninit({ attrs }) {
    this.ctrl = new TrainingCtrl(attrs.id)
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    signals.afterLogin.remove(this.ctrl.retry)
    window.plugins.insomnia.allowSleepAgain()
  },

  view
} as Mithril.Component<Attrs, State>
