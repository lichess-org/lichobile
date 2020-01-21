import * as Mithril from 'mithril'
import { Plugins } from '@capacitor/core'
import router from '../router'
import { handleXhrError } from '../utils'
import { positionsCache } from '../utils/gamePosition'
import { game as gameXhr } from '../xhr'
import storage from '../storage'
import * as sleepUtils from '../utils/sleep'
import * as gameApi from '../lichess/game'
import variantApi from '../lichess/variant'
import sound from '../sound'
import vibrate from '../vibrate'
import i18n from '../i18n'
import socket from '../socket'
import { emptyFen } from '../utils/fen'
import * as helper from './helper'
import OnlineRound from './shared/round/OnlineRound'
import roundView, { viewOnlyBoardContent } from './shared/round/view/roundView'
import gamesMenu from './gamesMenu'
import layout from './layout'
import { connectingHeader, loadingBackbutton } from './shared/common'

interface Attrs {
  id: string
  color?: Color
  goingBack?: string
}

interface State {
  round?: OnlineRound
}

export default {
  oninit({ attrs }) {
    sleepUtils.keepAwake()

    const now = performance.now()
    gameXhr(attrs.id, attrs.color)
    .then(data => {
      if (!data.player.spectator && !gameApi.isSupportedVariant(data)) {
        Plugins.LiToast.show({ text: i18n('unsupportedVariant', data.game.variant.name), duration: 'short' })
        router.set('/')
      }
      else {
        if (gameApi.isPlayerPlaying(data) &&
        gameApi.nbMoves(data, data.player.color) === 0) {
          sound.dong()
          vibrate.quick()
          const variant = variantApi(data.game.variant.key)
          const storageKey = variantStorageKey(data.game.variant.key)
          if (variant.alert && [1, 3].indexOf(variant.id) === -1 &&
          !storage.get(storageKey)) {
            Plugins.Modals.alert({
              title: 'Alert',
              message: variant.alert
            }).then(() => {
              storage.set(storageKey, true)
            })
          }
        }

        const elapsed = performance.now() - now

        setTimeout(() => {
          this.round = new OnlineRound(!!attrs.goingBack, attrs.id, data)
        }, Math.max(400 - elapsed, 0))

        gamesMenu.resetLastJoined()

        if (data.player.user === undefined) {
          storage.set('lastPlayedGameURLAsAnon', data.url.round)
        }
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
    if (this.round) {
      this.round.unload()
    }
  },

  view({ attrs }) {
    if (this.round) return roundView(this.round)

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

function variantStorageKey(variant: string) {
  return 'game.variant.prompt.' + variant
}
