import h from 'mithril/hyperscript'
import { safeStringToNum } from '../../../utils'

import * as helper from '../../helper'
import layout from '../../layout'
import { dropShadowHeader, backButton } from '../../shared/common'

import RelatedCtrl from './RelatedCtrl'
import { renderBody } from './relatedView'

interface Attrs {
  id: string
  tab?: string
  username?: string
  title?: string
}

interface State {
  ctrl: RelatedCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit(vnode) {
    this.ctrl = new RelatedCtrl(
      vnode.attrs.id,
      safeStringToNum(vnode.attrs.tab)
    )
  },
  view({ attrs }) {
    const name = attrs.username ? h('div.title', [
      h('span', [
        ...(attrs.title ? [h('span.userTitle', attrs.title), ' '] : []),
        attrs.username
      ])
    ]) : attrs.id

    return layout.free(
      dropShadowHeader(null, backButton(name)),
      renderBody(this.ctrl)
    )
  }
} as Mithril.Component<Attrs, State>
