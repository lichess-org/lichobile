import { Study } from '../../../lichess/interfaces/study'
import socket, { SocketIFace } from '../../../socket'
import session from '../../../session'
import settings from '../../../settings'

import { Chat } from '../../shared/chat'
import SideMenuCtrl from '../../shared/sideMenu/SideMenuCtrl'
import AnalyseCtrl from '../AnalyseCtrl'
import actionMenu, { IActionMenuCtrl } from './actionMenu'
import socketHandler from './studySocketHandler'
import startTour from './tour'

interface StudyVM {
  showComments: boolean
}

export default class StudyCtrl {
  public readonly sideMenu: SideMenuCtrl
  public readonly actionMenu: IActionMenuCtrl
  public readonly chat?: Chat
  public readonly vm: StudyVM
  public readonly analyseCtrl: AnalyseCtrl

  constructor(readonly data: Study, readonly rootCtrl: AnalyseCtrl) {
    this.actionMenu = actionMenu.controller(this.rootCtrl)
    this.sideMenu = new SideMenuCtrl('right', 'studyMenu', 'studyMenu-backdrop')
    this.analyseCtrl = rootCtrl

    if (data.features.chat && data.chat) {
      this.chat = new Chat(
        rootCtrl.socketIface,
        data.id,
        data.chat.lines,
        undefined,
        data.chat.writeable,
        session.isShadowban(),
        'Study'
      )
    }

    this.vm = {
      showComments: false,
    }

    if (settings.study.tour() === null) {
      startTour(this)
      settings.study.tour(window.deviceInfo.appVersion)
    }
  }

  public canContribute(): boolean {
    const myId = session.getUserId()
    const meMember = myId && this.data.members[myId]
    return meMember ? meMember.role === 'w' : false
  }

  public toggleLike = (): void => {
    this.rootCtrl.socketIface.send('like', {
      liked: !this.data.liked
    })
  }

  public toggleShowComments = (): void => {
    this.vm.showComments = !this.vm.showComments
  }

  public createSocket(): SocketIFace {
    return socket.createStudy(this.data.id, socketHandler(this))
  }
}
