import * as Mithril from 'mithril'
import router from '../../router'
import { handleXhrError } from '../../utils'
import { positionsCache } from '../../utils/gamePosition'
import { emptyFen } from '../../utils/fen'
import { game as gameXhr } from '../../xhr'
import * as sleepUtils from '../../utils/sleep'
import { isOnlineGameData, OnlineGameData } from '../../lichess/interfaces/game'
import { ChallengeData } from '../../lichess/interfaces/challenge'
import socket from '../../socket'
import * as helper from '../helper'
import roundView, { viewOnlyBoardContent } from '../shared/round/view/roundView'
import gamesMenu from '../gamesMenu'
import layout from '../layout'
import { connectingHeader, loadingBackbutton } from '../shared/common'
import ChallengeCtrl from './ChallengeCtrl'
import challengeView from './challengeView'
import GameCtrl from './GameCtrl'

interface Attrs {
  id: string
  color?: Color
  goingBack?: string
}

interface State {
  game?: GameCtrl
  challenge?: ChallengeCtrl
}

export default {
  oninit({ attrs }) {
    sleepUtils.keepAwake()

    const now = performance.now()
    gameXhr(attrs.id, attrs.color)
    .then(data => {
      if (isChallengeData(data)) {
        this.challenge = new ChallengeCtrl(data)
      } else if (isOnlineGameData(data)) {
        this.game = new GameCtrl(attrs.id, data, now, !!attrs.goingBack)
      }
    })
    .catch(error => {
      handleXhrError(error)
      router.set('/')
    })
  },

  oncreate(vnode) {
    if (vnode.attrs.goingBack) {
      helper.pageSlideIn(vnode.dom as HTMLElement)
    } else {
      helper.elFadeIn(vnode.dom as HTMLElement)
    }
  },

  onremove() {
    sleepUtils.allowSleepAgain()
    socket.destroy()
    if (this.game) {
      this.game.unload()
    }
    if (this.challenge) {
      this.challenge.unload()
    }
  },

  view({ attrs }) {
    if (this.challenge) return challengeView(this.challenge)
    if (this.game && this.game.round) return roundView(this.game.round)

    const pov = gamesMenu.lastJoined()
    let board: Mithril.Child

    if (pov) {
      board = viewOnlyBoardContent(pov.fen, pov.color, pov.lastMove,
      pov.variant.key)
    } else {
      const g = positionsCache.get(attrs.id)
      if (g)
        board = viewOnlyBoardContent(g.fen, g.orientation)
      else
        board = viewOnlyBoardContent(emptyFen, 'white')
    }

    return layout.board(
      attrs.goingBack ? loadingBackbutton() : connectingHeader(),
      board
    )
  }
} as Mithril.Component<Attrs, State>

function isChallengeData(d: OnlineGameData | ChallengeData): d is ChallengeData {
  return (<ChallengeData>d).challenge !== undefined
}
