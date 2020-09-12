import h from 'mithril/hyperscript'
import i18n from '../../i18n'
import * as sleepUtils from '../../utils/sleep'
import socket from '../../socket'
import settings from '../../settings'
import router from '../../router'
import redraw from '../../utils/redraw'
import { handleXhrError, safeStringToNum } from '../../utils'
import { specialFenVariants } from '../../lichess/variant'
import { getAnalyseData, getCurrentAIGame, getCurrentOTBGame } from '../../utils/offlineGames'
import * as helper from '../helper'
import { header, backButton as renderBackbutton, bookmarkButton } from '../shared/common'
import GameTitle from '../shared/GameTitle'
import layout from '../layout'
import { makeDefaultData } from './data'
import { gameAnalysis as gameAnalysisXhr } from './analyseXhr'
import { renderContent, overlay, loadingScreen, renderVariantSelector } from './view'
import AnalyseCtrl from './AnalyseCtrl'
import { Source } from './interfaces'

export interface Attrs {
  id: string
  source: Source
  color?: Color
  fen?: string
  variant?: VariantKey
  ply?: string
  tabId?: string
  // fen used for placeholder board while loading
  curFen?: string
  goBack?: string
  slide?: string
  fallback?: boolean
}

export interface State {
  ctrl?: AnalyseCtrl
}

export default {
  oninit(vnode) {
    const source = vnode.attrs.source || 'offline'
    const gameId = vnode.attrs.id
    const orientation: Color = vnode.attrs.color || 'white'
    const fenArg = vnode.attrs.fen
    const variant = vnode.attrs.variant
    const ply = safeStringToNum(vnode.attrs.ply)
    const tabId = vnode.attrs.tabId

    const shouldGoBack = gameId !== undefined || fenArg !== undefined || vnode.attrs.goBack === '1'

    sleepUtils.keepAwake()

    if (source === 'online' && gameId) {
      const now = performance.now()
      gameAnalysisXhr(gameId, orientation)
      .then(cfg => {
        const elapsed = performance.now() - now
        setTimeout(() => {
          this.ctrl = new AnalyseCtrl(cfg, undefined, source, orientation, shouldGoBack, ply, tabId)
          redraw()
        }, Math.max(400 - elapsed, 0))
      })
      .catch(err => {
        handleXhrError(err)
        if (vnode.attrs.fallback && vnode.attrs.curFen && vnode.attrs.color) {
          router.set(`/analyse/variant/standard/fen/${encodeURIComponent(vnode.attrs.curFen)}?color=${vnode.attrs.color}&goBack=1`)
        } else {
          router.set('/analyse', true)
        }
        redraw()
      })
    } else if (source === 'offline' && gameId === 'otb') {
      getCurrentOTBGame()
      .then(savedOtbGame => {
        setTimeout(() => {
          const otbData = savedOtbGame && getAnalyseData(savedOtbGame, orientation)
          if (!otbData) {
            router.set('/analyse', true)
          } else {
            otbData.player.spectator = true
            this.ctrl = new AnalyseCtrl(otbData, undefined, source, orientation, shouldGoBack, ply, tabId)
            redraw()
          }
        }, 400)
      })
    } else if (source === 'offline' && gameId === 'ai') {
      getCurrentAIGame()
      .then(savedAiGame => {
        setTimeout(() => {
          const aiData = savedAiGame && getAnalyseData(savedAiGame, orientation)
          if (!aiData) {
            router.set('/analyse', true)
          } else {
            aiData.player.spectator = true
            this.ctrl = new AnalyseCtrl(aiData, undefined, source, orientation, shouldGoBack, ply, tabId)
            redraw()
          }
        }, 400)
      })
    } else {
      if (variant === undefined) {
        let settingsVariant = settings.analyse.syntheticVariant()
        // don't allow special variants fen since they are not supported
        if (fenArg) {
          settingsVariant = specialFenVariants.has(settingsVariant) ?
            'standard' : settingsVariant
        }
        let url = `/analyse/variant/${settingsVariant}`
        if (fenArg) url += `/fen/${encodeURIComponent(fenArg)}`
        router.set(url, true)
        redraw()
      } else {
        this.ctrl = new AnalyseCtrl(makeDefaultData(variant, fenArg), undefined, source, orientation, shouldGoBack, ply, tabId)
        redraw()
      }
    }
  },

  oncreate(vnode) {
    if (vnode.attrs.slide === '1') {
      helper.pageSlideIn(vnode.dom as HTMLElement)
    } else {
      helper.elFadeIn(vnode.dom as HTMLElement)
    }
  },

  onremove() {
    sleepUtils.allowSleepAgain()
    socket.destroy()
    if (this.ctrl) {
      this.ctrl.unload()
      this.ctrl = undefined
    }
  },

  view(vnode) {
    const isPortrait = helper.isPortrait()

    if (this.ctrl) {

      let backButton: Mithril.Children = null
      if (this.ctrl.shouldGoBack) {
        if (this.ctrl.data.game.id === 'synthetic') {
          backButton = renderBackbutton(h('div.main_header_title', i18n('analysis')))
        } else {
          backButton = renderBackbutton([
            h(GameTitle, { data: this.ctrl.data, subTitle: 'date' }),
            bookmarkButton(this.ctrl.toggleBookmark, this.ctrl.data.bookmarked!!),
          ])
        }
      }

      const title = this.ctrl.shouldGoBack ? null : h('div.main_header_title.withSub', [
        h('div', i18n('analysis')),
        renderVariantSelector(this.ctrl)
      ])

      return layout.board(
        header(title, backButton),
        renderContent(this.ctrl!, isPortrait),
        undefined,
        overlay(this.ctrl!)
      )
    } else {
      return loadingScreen(isPortrait, vnode.attrs.color, vnode.attrs.curFen)
    }
  }
} as Mithril.Component<Attrs, State>
