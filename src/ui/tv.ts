import h from 'mithril/hyperscript'
import router from '../router'
import socket from '../socket'
import * as helper from './helper'
import * as sleepUtils from '../utils/sleep'
import { handleXhrError } from '../utils'
import * as xhr from '../xhr'
import settings from '../settings'
import OnlineRound from './shared/round/OnlineRound'
import roundView, { LoadingBoard } from './shared/round/view/roundView'

interface TVAttrs {
  id: string
  color: Color
  flip: boolean
  channel?: string
}

interface State {
  round: OnlineRound
}

const TV: Mithril.Component<TVAttrs, State> = {
  oninit(vnode) {
    sleepUtils.keepAwake()

    const onChannelChange = () => router.set('/tv', true)
    const onFeatured = () => router.set('/tv', true)

    if (vnode.attrs.channel) {
      settings.tv.channel(vnode.attrs.channel)
    }

    xhr.featured(settings.tv.channel(), vnode.attrs.flip)
    .then(d => {
      d.tv = settings.tv.channel()
      this.round = new OnlineRound(false, vnode.attrs.id, d, vnode.attrs.flip, onFeatured, onChannelChange)
    })
    .catch(error => {
      handleXhrError(error)
      if (error.status === 404 && settings.tv.channel() !== 'best') {
        settings.tv.channel('best')
        router.set('/tv/', true)
      }
    })
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

export default TV
