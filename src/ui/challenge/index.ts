import * as throttle from 'lodash/throttle'
import socket from '../../socket'
import redraw from '../../utils/redraw'
import * as helper from '../helper'
import router from '../../router'
import { handleXhrError } from '../../utils'
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr'
import { Challenge } from '../../lichess/interfaces/challenge'
import challengesApi from '../../lichess/challenges'
import { standardFen } from '../../lichess/variant'
import i18n from '../../i18n'
import * as stream from 'mithril/stream'
import layout from '../layout'
import { viewOnlyBoardContent, header as headerWidget } from '../shared/common'
import { joinPopup, awaitChallengePopup, awaitInvitePopup } from './challengeView'
import { ChallengeState } from './interfaces'

const throttledPing = throttle((): void => socket.send('ping'), 1000)

interface Attrs {
  id: string
}

const ChallengeScreen: Mithril.Component<Attrs, ChallengeState> = {
  oncreate: helper.viewFadeIn,

  onremove() {
    socket.destroy()
    window.plugins.insomnia.allowSleepAgain()
    clearTimeout(this.pingTimeoutId)
  },

  oninit(vnode) {
    const challenge: Mithril.Stream<Challenge | undefined> = stream(undefined)

    window.plugins.insomnia.keepAwake()

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
              window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center')
              router.backHistory()
              break
          }
        })
      }
    }

    const pingNow = () => {
      throttledPing()
      this.pingTimeoutId = setTimeout(pingNow, 2000)
    }

    const onSocketOpen = () => {
      // reload on open in case the reload msg has not been received
      reloadChallenge()
      pingNow()
    }

    getChallenge(vnode.attrs.id).then(d => {
      challenge(d.challenge)
      socket.createChallenge(d.challenge.id, d.socketVersion, onSocketOpen, {
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
        .then(d => router.set('/game' + d.url.round, true))
        .then(() => challengesApi.remove(c.id))
      }
      return Promise.reject('no challenge')
    }

    this.declineChallenge = () => {
      const c = challenge()
      if (c) {
        return declineChallenge(c.id)
        .then(() => challengesApi.remove(c.id))
        .then(router.backHistory)
      }
      return Promise.reject('no challenge')
    }

    this.cancelChallenge = () => {
      const c = challenge()
      if (c) {
        return cancelChallenge(c.id)
        .then(() => challengesApi.remove(c.id))
        .then(router.backHistory)
      }
      return Promise.reject('no challenge')
    }
  },

  view() {
    let overlay: (() => Mithril.Children) | undefined = undefined
    let board = () => viewOnlyBoardContent(standardFen, 'white')

    const challenge = this.challenge()

    const header = () => headerWidget('lichess.org')

    if (challenge) {
      board = () => viewOnlyBoardContent(
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
}

export default ChallengeScreen
