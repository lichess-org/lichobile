import redraw from '../../utils/redraw'
import * as helper from '../helper'

import AnalyseCtrl from '../analyse/AnalyseCtrl'
import analyseView from '../analyse/view/analyseView'
import { load as loadStudy } from '../analyse/study/studyXhr'

export interface Attrs {
  id: string
  color?: Color
}

export interface State {
  ctrl?: AnalyseCtrl
}

export default {
  oninit(vnode) {
    const studyId = vnode.attrs.id
    const now = performance.now()
    const orientation: Color = vnode.attrs.color || 'white'
    loadStudy(studyId)
    .then(data => {
      const elapsed = performance.now() - now
      setTimeout(() => {
        this.ctrl = new AnalyseCtrl(data.analysis, data.study, 'online', orientation, true)
        redraw()
      }, Math.max(400 - elapsed, 0))
    })
  },

  oncreate(vnode) {
    helper.pageSlideIn(vnode.dom as HTMLElement)
  },

  view() {
    return analyseView(this.ctrl)
  }

} as Mithril.Component<Attrs, State>
