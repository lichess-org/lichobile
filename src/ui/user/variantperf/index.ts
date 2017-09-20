import * as stream from 'mithril/stream'
import * as helper from '../../helper'
import * as xhr from '../userXhr'
import socket from '../../../socket'
import { handleXhrError } from '../../../utils'
import redraw from '../../../utils/redraw'
import spinner from '../../../spinner'
import { header as headerWidget, backButton } from '../../shared/common'
import { shortPerfTitle } from '../../../lichess/perfs'
import { User, VariantPerfStats } from '../../../lichess/interfaces/user'
import { VariantKey } from '../../../lichess/interfaces/variant'
import layout from '../../layout'
import { renderBody } from './variantPerfView'

interface Attrs {
  id: string
  variant: VariantKey
}

export interface State {
  user: Mithril.Stream<User>
  variantPerfData: Mithril.Stream<VariantPerfStats>
}

const VariantPerfScreen: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewSlideIn,

  oninit(vnode) {
    const userId = vnode.attrs.id
    const variant = vnode.attrs.variant
    const user = stream() as Mithril.Stream<User>
    const variantPerfData = stream() as Mithril.Stream<VariantPerfStats>

    socket.createDefault()

    spinner.spin()
    Promise.all([
      xhr.user(userId, false),
      xhr.variantperf(userId, variant)
    ])
    .then(results => {
      spinner.stop()
      const [userData, variantData] = results
      user(userData)
      variantPerfData(variantData)
      redraw()
    })
    .catch(err => {
      spinner.stop()
      handleXhrError(err)
    })

    vnode.state = {
      user,
      variantPerfData
    }
  },

  view(vnode) {
    const ctrl = vnode.state
    const userId = vnode.attrs.id
    const variant = vnode.attrs.variant
    const header = () => headerWidget(null,
      backButton(userId + ' ' + shortPerfTitle(variant as PerfKey) + ' stats')
    )

    return layout.free(header, () => renderBody(ctrl))
  }
}

export default VariantPerfScreen
