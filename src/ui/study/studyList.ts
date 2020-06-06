import * as Mithril from 'mithril'
import socket from '../../socket'
import { PagerCategory, PagerOrder } from '../../lichess/interfaces/study'
import i18n from '../../i18n'
import * as helper from '../helper'
import { header } from '../shared/common'
import layout from '../layout'

import StudyListCtrl from './StudyListCtrl'
import studyListView from './studyListView'

interface Attrs {
  cat?: PagerCategory
  order?: PagerOrder
  q?: string
}

interface State {
  ctrl: StudyListCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = new StudyListCtrl(attrs.cat, attrs.order, attrs.q)
  },

  view() {
    const ctrl = this.ctrl

    return layout.free(header(i18n('studyMenu')), studyListView(ctrl))
  }

} as Mithril.Component<Attrs, State>

