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
    window.removeEventListener('keyboardDidShow', this.ctrl.onKeyboardShow)
    window.removeEventListener('keyboardDidHide', helper.onKeyboardHide)
  },

  view() {
    const header = headerWidget(null,
      backButton(this.ctrl.thread() ? this.ctrl.thread().name : undefined)
    )
    const body = threadBody(this.ctrl)
    return layout.free(header, body)
  }
} as Mithril.Component<Attrs, State>
