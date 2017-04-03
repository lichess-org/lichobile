import * as helper from '../../helper'
import layout from '../../layout'
import { header } from '../../shared/common'

import FollowingCtrl, { IRelationCtrl } from './followingCtrl'
import { renderBody } from './followingView'

interface Attrs {
  id: string
}

interface State {
  ctrl: IRelationCtrl
}

const FollowersScreen: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewFadeIn,

  oninit(vnode) {
    helper.analyticsTrackView('User following')

    this.ctrl = FollowingCtrl(vnode.attrs.id)
  },
  view() {
    return layout.free(
      () => header('Following'),
      () => renderBody(this.ctrl)
    )
  }
}

export default FollowersScreen

