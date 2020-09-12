import * as helper from '../../helper'
import { header as headerWidget, backButton } from '../../shared/common'
import layout from '../../layout'
import i18n from '../../../i18n'
import socket from '../../../socket'
import { composeBody } from './composeView'

import ComposeCtrl, { IComposeCtrl } from './ComposeCtrl'

interface Attrs {
  userId: string
}

interface State {
  ctrl: IComposeCtrl
}

export default {

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = ComposeCtrl(attrs.userId)
  },

  oncreate: helper.viewFadeIn,

  view() {
    const header = headerWidget(null,
      backButton(i18n('composeMessage'))
    )
    const body = composeBody(this.ctrl)
    return layout.free(header, body)
  }
} as Mithril.Component<Attrs, State>
