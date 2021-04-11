import CoordCtrl from './coordCtrl'
import coordinatesView from './coordView'

interface State {
  coordCtrl: CoordCtrl;
}

const CoordinatesBoard: Mithril.Component<any, State> = {
  oninit() {
    this.coordCtrl = new CoordCtrl()
  },

  view() {
    return coordinatesView(this.coordCtrl)
  },
}

export default CoordinatesBoard
