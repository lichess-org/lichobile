import h from 'mithril/hyperscript'
import router from '../../router'
import socket from '../../socket'
import * as helper from '../helper'
import * as sleepUtils from '../../utils/sleep'
import { handleXhrError } from '../../utils'
import OnlineRound from '../shared/round/OnlineRound'
import roundView, { LoadingBoard } from '../shared/round/view/roundView'
import { tv } from './userXhr'

interface Attrs {
  id: string
}

interface State {
  round: OnlineRound
}

const UserTv: Mithril.Component<Attrs, State> = {
  oninit(vnode) {
    sleepUtils.keepAwake()

    const userId = vnode.attrs.id
    const onRedirect = () => router.set(`/@/${userId}/tv`, true)

    tv(userId)
    .then(data => {
      data.userTV = userId
      this.round = new OnlineRound(false, data.game.id, data, false, undefined, undefined, userId, onRedirect)
    })
    .catch(handleXhrError)
  },

  oncreate: helper.viewFadeIn,

  onremove() {
    sleepUtils.allowSleepAgain()
    socket.destroy()
    if (this.round) {
      this.round.unload()
    }
  },

  view() {
    if (this.round) {
      return roundView(this.round)
    } else {
      return h(LoadingBoard)
    }
  }
}

export default UserTv
