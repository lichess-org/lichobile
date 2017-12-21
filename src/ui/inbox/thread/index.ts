import socket from '../../../socket'
import * as helper from '../../helper'
import { header as headerWidget, backButton } from '../../shared/common'
import layout from '../../layout'

import { threadBody } from './threadView'
import ThreadCtrl, { IThreadCtrl } from './threadCtrl'

interface Attrs {
  id: string
}

interface State {
  ctrl: IThreadCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit({ attrs }) {
    socket.createDefault()

    this.ctrl = ThreadCtrl(attrs.id)
  },

  onremove() {
    window.removeEventListener('native.keyboardshow', this.ctrl.onKeyboardShow)
    window.removeEventListener('native.keyboardhide', helper.onKeyboardHide)
  },

  view() {
    const headerCtrl = () => headerWidget(null,
      backButton(this.ctrl.thread() ? this.ctrl.thread().name : undefined)
    )
    const bodyCtrl = () => threadBody(this.ctrl)
    return layout.free(headerCtrl, bodyCtrl)
  }
} as Mithril.Component<Attrs, State>
