import * as helper from '../../helper'
import layout from '../../layout'
import { header } from '../../shared/common'

import FollowersCtrl, { IFollowersCtrl } from './followersCtrl'
import { renderBody } from './followersView'

interface Attrs {
  id: string
}

interface State {
  ctrl: IFollowersCtrl
}

const FollowersScreen: Mithril.Component<Attrs, State> = {
  oncreate: helper.viewFadeIn,

  oninit(vnode) {
    helper.analyticsTrackView('User followers')

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
