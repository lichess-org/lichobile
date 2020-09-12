import h from 'mithril/hyperscript'
import * as helper from '../../helper'
import * as xhr from '../userXhr'
import socket from '../../../socket'
import { handleXhrError, gameIcon, prop, Prop } from '../../../utils'
import redraw from '../../../utils/redraw'
import spinner from '../../../spinner'
import { header as headerWidget, backButton } from '../../shared/common'
import { shortPerfTitle } from '../../../lichess/perfs'
import { User, PerfStats } from '../../../lichess/interfaces/user'
import layout from '../../layout'
import { renderBody } from './variantPerfView'

interface Attrs {
  id: string
  perf: PerfKey
}

export interface State {
  user: Prop<User | null>
  perfData: Prop<PerfStats | null>
}

export default {
  oncreate: helper.viewSlideIn,

  oninit(vnode) {
    const userId = vnode.attrs.id
    const perf = vnode.attrs.perf

    this.user = prop<User | null>(null)
    this.perfData = prop<PerfStats | null>(null)

    socket.createDefault()

    spinner.spin()
    Promise.all([
      xhr.user(userId, false),
      xhr.variantperf(userId, perf)
    ])
    .then(results => {
      spinner.stop()
      const [userData, variantData] = results
      this.user(userData)
      this.perfData(variantData)
      redraw()
    })
    .catch(err => {
      spinner.stop()
      handleXhrError(err)
    })
  },

  view(vnode) {
    const userId = vnode.attrs.id
    const perf = vnode.attrs.perf
    const header = headerWidget(null,
      backButton(h('div.main_header_title', [
        h('span.withIcon', { 'data-icon': gameIcon(perf) }),
        userId + ' ' + shortPerfTitle(perf as PerfKey) + ' stats'
      ]))
    )

    return layout.free(header, renderBody(this))
  }
} as Mithril.Component<Attrs, State>
