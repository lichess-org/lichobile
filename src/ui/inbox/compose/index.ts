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

const ComposeScreen: Mithril.Component<Attrs, State> = {

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = ComposeCtrl(attrs.userId)
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    window.removeEventListener('native.keyboardshow', helper.onKeyboardShow)
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide)
  },

  view() {
    const headerCtrl = () => headerWidget(null,
      backButton(i18n('composeMessage'))
    )
    const bodyCtrl = () => composeBody(this.ctrl)
    return layout.free(headerCtrl, bodyCtrl)
  }
}

export default ComposeScreen
