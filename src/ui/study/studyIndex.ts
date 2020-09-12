import socket from '../../socket'
import { PagerCategory, PagerOrder } from '../../lichess/interfaces/study'
import i18n from '../../i18n'
import * as helper from '../helper'
import { header } from '../shared/common'
import layout from '../layout'

import StudyIndexCtrl from './StudyIndexCtrl'
import studyIndexView from './studyIndexView'

interface Attrs {
  cat?: PagerCategory
  order?: PagerOrder
  q?: string
}

interface State {
  ctrl: StudyIndexCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = new StudyIndexCtrl(attrs.cat, attrs.order, attrs.q)
  },

  view() {
    const ctrl = this.ctrl

    return layout.free(header(i18n('studyMenu')), studyIndexView(ctrl))
  }

} as Mithril.Component<Attrs, State>
