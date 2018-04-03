import { Study } from '../../../lichess/interfaces/study'

import SideMenuCtrl from '../../shared/sideMenu/SideMenuCtrl'

export default class StudyCtrl {
  public readonly data: Study
  public readonly sideMenu: SideMenuCtrl

  constructor(data: Study) {
    this.data = data
    this.sideMenu = new SideMenuCtrl('right', 'studyMenu', 'studyMenu-backdrop')
  }
}
