import * as Mithril from 'mithril'
import socket from '../../../socket'
import * as helper from '../../helper'
import { dropShadowHeader as headerWidget, backButton } from '../../shared/common'
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

  view() {
    const header = headerWidget(null,
      backButton(this.ctrl.thread() ? this.ctrl.thread().name : undefined)
    )
    const body = threadBody(this.ctrl)
    return layout.free(header, body)
  }
} as Mithril.Component<Attrs, State>
