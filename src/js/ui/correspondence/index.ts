import i18n from '../../i18n'
import * as helper from '../helper'
import layout from '../layout'
import { header as headerWidget } from '../shared/common'
import { renderBody, renderFooter } from './correspondenceView'
import CorrespondenceCtrl from './CorrespondenceCtrl'

interface Attrs {
  tab: number
}

interface State {
  ctrl: CorrespondenceCtrl
}

export default {
  oninit({ attrs }) {
    this.ctrl = new CorrespondenceCtrl(attrs.tab)
  },

  oncreate: helper.viewFadeIn,

  view() {
    const header = () => headerWidget(i18n('correspondence'))
    const body = () => renderBody(this.ctrl)

    return layout.free(header, body, renderFooter)
  }
} as Mithril.Component<Attrs, State>
