import { Study } from '../../../lichess/interfaces/study'
import socket from '../../../socket'
import session from '../../../session'

import SideMenuCtrl from '../../shared/sideMenu/SideMenuCtrl'
import AnalyseCtrl from '../AnalyseCtrl'
import actionMenu, { IActionMenuCtrl } from './actionMenu'
import socketHandler from './studySocketHandler'

export default class StudyCtrl {
  public readonly data: Study
  public readonly sideMenu: SideMenuCtrl
  public readonly actionMenu: IActionMenuCtrl

  private rootCtrl: AnalyseCtrl

  constructor(data: Study, rootCtrl: AnalyseCtrl) {
    this.data = data
    this.rootCtrl = rootCtrl
    this.actionMenu = actionMenu.controller(this.rootCtrl)
    this.sideMenu = new SideMenuCtrl('right', 'studyMenu', 'studyMenu-backdrop')
  }

  public canContribute(): boolean {
    const myId = session.getUserId()
    const meMember = myId && this.data.members[myId]
    return meMember ? meMember.role === 'w' : false
  }

  public toggleLike = (): void => {
    socket.send('like', {
      liked: !this.data.liked
    })
  }

  public createSocket(): void {
    socket.createStudy(this.data.id, socketHandler(this))
  }
}
