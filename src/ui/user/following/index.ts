import * as helper from '../../helper'
import layout from '../../layout'
import { header } from '../../shared/common'

import FollowingCtrl from './followingCtrl'
import { IRelationCtrl } from '../interfaces'
import { renderBody } from '../relatedView'

interface Attrs {
  id: string
}

interface State {
  ctrl: IRelationCtrl
}

export default {
  oncreate: helper.viewFadeIn,

  oninit(vnode) {
    this.ctrl = FollowingCtrl(vnode.attrs.id)
  },
  view() {
    return layout.free(
      () => header('Following'),
      () => renderBody(this.ctrl)
    )
  }
} as Mithril.Component<Attrs, State>
