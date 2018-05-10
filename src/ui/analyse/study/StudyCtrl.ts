import { Study } from '../../../lichess/interfaces/study'
import socket from '../../../socket'
import session from '../../../session'

import { Chat } from '../../shared/chat'
import SideMenuCtrl from '../../shared/sideMenu/SideMenuCtrl'
import AnalyseCtrl from '../AnalyseCtrl'
import actionMenu, { IActionMenuCtrl } from './actionMenu'
import socketHandler from './studySocketHandler'

export default class StudyCtrl {
  public readonly sideMenu: SideMenuCtrl
  public readonly actionMenu: IActionMenuCtrl
  public readonly chat?: Chat

  private readonly rootCtrl: AnalyseCtrl

  constructor(readonly data: Study, rootCtrl: AnalyseCtrl) {
    this.rootCtrl = rootCtrl
    this.actionMenu = actionMenu.controller(this.rootCtrl)
    this.sideMenu = new SideMenuCtrl('right', 'studyMenu', 'studyMenu-backdrop')

    if (data.features.chat && data.chat) {
      this.chat = new Chat(
        data.id,
        data.chat.lines,
        undefined,
        data.chat.writeable,
        session.isShadowban()
      )
    }
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
