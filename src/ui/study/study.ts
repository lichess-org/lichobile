import h from 'mithril/hyperscript'
import redraw from '../../utils/redraw'
import socket from '../../socket'
import * as sleepUtils from '../../utils/sleep'
import router from '../../router'
import * as utils from '../../utils'
import * as helper from '../helper'
import layout from '../layout'
import EdgeOpenHandler, { Handlers } from '../shared/sideMenu/EdgeOpenHandler'

import AnalyseCtrl from '../analyse/AnalyseCtrl'
import { renderContent, overlay, loadingScreen } from '../analyse/view'

import { load as loadStudy } from './studyXhr'
import { notFound, studyHeader } from './studyView'
import RightSideMenu from './RightSideMenu'

export interface Attrs {
  id: string
  chapterId?: string
  ply?: string
  tabId?: string
  // fen used for placeholder board while loading
  curFen?: string
}

export interface State {
  ctrl?: AnalyseCtrl
  notFound?: boolean
  handlers?: Handlers
}

export default {
  oninit(vnode) {
    const studyId = vnode.attrs.id
    const studyChapterId = vnode.attrs.chapterId
    const now = performance.now()
    const ply = utils.safeStringToNum(vnode.attrs.ply)
    const tabId = vnode.attrs.tabId

    sleepUtils.keepAwake()

    loadStudy(studyId, studyChapterId)
    .then(data => {
      const elapsed = performance.now() - now
      setTimeout(() => {
        this.ctrl = new AnalyseCtrl(
          data.analysis,
          data.study,
          'online',
          data.study.chapter.setup.orientation,
          true,
          ply || 0,
          tabId
        )
        this.handlers = EdgeOpenHandler(this.ctrl.study!.sideMenu)
        redraw()
      }, Math.max(400 - elapsed, 0))
    })
    .catch(err => {
      if (err.status === 404) {
        this.notFound = true
        redraw()
      } else {
        utils.handleXhrError(err)
      }
    })
  },

  oncreate(vnode) {
    // don't want to slide when changing chapter
    if (router.getPreviousPath().startsWith('/study/')) {
      helper.elFadeIn(vnode.dom as HTMLElement)
    } else {
      helper.pageSlideIn(vnode.dom as HTMLElement)
    }
  },

  onremove() {
    sleepUtils.allowSleepAgain()
    socket.destroy()
    if (this.ctrl) {
      this.ctrl.unload()
      this.ctrl = undefined
    }
  },

  view(vnode) {
    if (this.notFound) {
      return notFound()
    }

    const isPortrait = helper.isPortrait()
    const ctrl = this.ctrl

    if (ctrl) {

      return layout.board(
        studyHeader(ctrl.study!.data),
        renderContent(ctrl, isPortrait),
        undefined,
        [
          ...overlay(ctrl),
          h(RightSideMenu, { studyCtrl: ctrl.study! }),
          h('div#studyMenu-backdrop.menu-backdrop', {
            oncreate: helper.ontap(() => ctrl.study!.sideMenu.close())
          })
        ],
        this.handlers
      )
    } else {
      return loadingScreen(isPortrait, undefined, vnode.attrs.curFen)
    }
  }

} as Mithril.Component<Attrs, State>
