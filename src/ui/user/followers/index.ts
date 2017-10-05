import * as helper from '../../helper'
import layout from '../../layout'
import { header } from '../../shared/common'

import FollowersCtrl from './followersCtrl'
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
    this.ctrl = FollowersCtrl(vnode.attrs.id)
  },
  view() {
    return layout.free(
      () => header('Followers'),
      () => renderBody(this.ctrl)
    )
  }
} as Mithril.Component<Attrs, State>
