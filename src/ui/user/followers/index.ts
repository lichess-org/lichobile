import * as helper from '../../helper'
import layout from '../../layout'
import { header } from '../../shared/common'

import FollowersCtrl from './followersCtrl'
import { IRelationCtrl } from '../following/followingCtrl'
import { renderBody } from './followersView'

interface Attrs {
  id: string
}

interface State {
  ctrl: IRelationCtrl
}

const FollowersScreen: Mithril.Component<Attrs, State> = {
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
}

export default FollowersScreen
