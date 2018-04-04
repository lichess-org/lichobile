import { Study } from '../../../lichess/interfaces/study'
import session from '../../../session'

import SideMenuCtrl from '../../shared/sideMenu/SideMenuCtrl'

export default class StudyCtrl {
  public readonly data: Study
  public readonly sideMenu: SideMenuCtrl

  constructor(data: Study) {
    this.data = data
    this.sideMenu = new SideMenuCtrl('right', 'studyMenu', 'studyMenu-backdrop')
  }

  public canContribute(): boolean {
    const myId = session.getUserId()
    const meMember = myId && this.data.members[myId]
    return meMember ? meMember.role === 'w' : false
  }
}
