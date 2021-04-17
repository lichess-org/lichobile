import * as helper from '../helper'
import CoordCtrl from './CoordCtrl'
import coordinatesView from './coordView'

interface State {
  coordCtrl: CoordCtrl
}

export default {
  oninit() {
    this.coordCtrl = new CoordCtrl()
  },

  oncreate: helper.viewFadeIn,

  view() {
    return coordinatesView(this.coordCtrl)
  },
} as Mithril.Component<unknown, State>
