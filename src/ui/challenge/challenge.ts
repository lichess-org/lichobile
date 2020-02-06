import * as Mithril from 'mithril'
import Stream from 'mithril/stream'
import socket, { SocketIFace } from '../../socket'
import redraw from '../../utils/redraw'
import * as helper from '../helper'
import router from '../../router'
import * as sleepUtils from '../../utils/sleep'
import { handleXhrError } from '../../utils'
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr'
import { Challenge } from '../../lichess/interfaces/challenge'
import challengesApi from '../../lichess/challenges'
import { standardFen } from '../../lichess/variant'
import layout from '../layout'
import { viewOnlyBoardContent } from '../shared/round/view/roundView'
import { header as headerWidget } from '../shared/common'
import { joinPopup, awaitChallengePopup, awaitInvitePopup } from './challengeView'
import { ChallengeState } from './interfaces'

interface Attrs {
  id: string
}

export default {
  oncreate: helper.viewFadeIn,

  onremove() {
    socket.destroy()
    sleepUtils.allowSleepAgain()
    clearTimeout(this.pingTimeoutId)
  },

  oninit(vnode) {
    let socketIface: SocketIFace

    const challenge: Stream<Challenge | undefined> = Stream(undefined)

    sleepUtils.keepAwake()

    const reloadChallenge = () => {
      const c = challenge()
      if (c) {
        getChallenge(c.id)
        .then(d => {
          challenge(d.challenge)
          switch (d.challenge.status) {
            case 'accepted':
              router.set(`/game/${d.challenge.id}`, true)
              break
            case 'declined':
              router.backHistory()
              break
          }
        })
      }
    }

    const pingNow = () => {
      clearTimeout(this.pingTimeoutId)
      this.pingTimeoutId = setTimeout(pingNow, 2000)
      if (socketIface) socketIface.send('ping')
    }

    const onSocketOpen = () => {
      // reload on open in case the reload msg has not been received
      reloadChallenge()
      pingNow()
    }

    getChallenge(vnode.attrs.id).then(d => {
      challenge(d.challenge)
      socketIface = socket.createChallenge(d.challenge.id, d.socketVersion, onSocketOpen, {
        reload: reloadChallenge
      })
      redraw()
    })
    .catch(err => {
      handleXhrError(err)
      router.set('/')
    })

    this.challenge = challenge

    this.joinChallenge = () => {
      const c = challenge()
      if (c) {
        return acceptChallenge(c.id)
        .then(d => {
          clearTimeout(this.pingTimeoutId)
          router.set('/game' + d.url.round, true)
        })
        .then(() => challengesApi.remove(c.id))
      }
      return Promise.reject('no challenge')
    }

    this.declineChallenge = () => {
      const c = challenge()
      if (c) {
        return declineChallenge(c.id)
        .then(() => {
          clearTimeout(this.pingTimeoutId)
          challengesApi.remove(c.id)
        })
        .then(router.backHistory)
      }
      return Promise.reject('no challenge')
    }

    this.cancelChallenge = () => {
      const c = challenge()
      if (c) {
        return cancelChallenge(c.id)
        .then(() => {
          clearTimeout(this.pingTimeoutId)
          challengesApi.remove(c.id)
        })
        .then(router.backHistory)
      }
      return Promise.reject('no challenge')
    }
  },

  view() {
    let overlay: Mithril.Children | undefined = undefined
    let board = viewOnlyBoardContent(standardFen, 'white')

    const challenge = this.challenge()

    const header = headerWidget('lichess.org')

    if (challenge) {
      board = viewOnlyBoardContent(
        challenge.initialFen || standardFen,
        'white'
      )

      if (challenge.direction === 'in') {
        overlay = joinPopup(this, challenge)
      } else if (challenge.direction === 'out') {
        if (challenge.destUser) {
          overlay = awaitChallengePopup(this, challenge)
        } else {
          overlay = awaitInvitePopup(this, challenge)
        }
      }
    }

    return layout.board(header, board, overlay)
  }
} as Mithril.Component<Attrs, ChallengeState>
