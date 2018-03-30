import redraw from '../../utils/redraw'
import * as utils from '../../utils'
import * as helper from '../helper'
import layout from '../layout'

import AnalyseCtrl from '../analyse/AnalyseCtrl'
import { renderContent, overlay, loadingScreen } from '../analyse/view'
import { load as loadStudy } from '../analyse/study/studyXhr'

import { notFound, studyHeader } from './studyView'

export interface Attrs {
  id: string
  color?: Color
  ply?: string
  tab?: string
  // fen used for placeholder board while loading
  curFen?: string
}

export interface State {
  ctrl?: AnalyseCtrl
  notFound?: boolean
}

export default {
  oninit(vnode) {
    const studyId = vnode.attrs.id
    const now = performance.now()
    const orientation: Color = vnode.attrs.color || 'white'
    const ply = utils.safeStringToNum(vnode.attrs.ply)
    const tab = utils.safeStringToNum(vnode.attrs.tab)

    loadStudy(studyId)
    .then(data => {
      const elapsed = performance.now() - now
      setTimeout(() => {
        this.ctrl = new AnalyseCtrl(
          data.analysis,
          data.study,
          'online',
          orientation,
          true,
          ply || 0,
          tab
        )
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
    helper.pageSlideIn(vnode.dom as HTMLElement)
  },

  view(vnode) {
    if (this.notFound) {
      return notFound()
    }

    const isPortrait = helper.isPortrait()

    if (this.ctrl) {
      const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, this.ctrl.settings.s.smallBoard)

      return layout.board(
        () => studyHeader(this.ctrl!.study!.data),
        () => renderContent(this.ctrl!, isPortrait, bounds),
        () => overlay(this.ctrl!)
      )
    } else {
      return loadingScreen(isPortrait, vnode.attrs.color, vnode.attrs.curFen)
    }
  }

} as Mithril.Component<Attrs, State>
