import { Study } from '../../../lichess/interfaces/study'

import SideMenuCtrl from './SideMenuCtrl'

export default class StudyCtrl {
  public data: Study
  public sideMenu: SideMenuCtrl

  constructor(data: Study) {
    this.data = data
    this.sideMenu = new SideMenuCtrl()
  }

}
