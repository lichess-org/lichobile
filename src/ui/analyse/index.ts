import * as h from 'mithril/hyperscript'
import socket from '../../socket'
import settings from '../../settings'
import router from '../../router'
import redraw from '../../utils/redraw'
import { handleXhrError, safeStringToNum } from '../../utils'
import i18n from '../../i18n'
import { specialFenVariants } from '../../lichess/variant'
import { emptyFen } from '../../utils/fen'
import spinner from '../../spinner'
import { getAnalyseData, getCurrentAIGame, getCurrentOTBGame } from '../../utils/offlineGames'
import * as helper from '../helper'
import { loadingBackbutton, header, backButton as renderBackbutton } from '../shared/common'
import GameTitle from '../shared/GameTitle'
import { makeDefaultData } from './data'
import { gameAnalysis as gameAnalysisXhr } from './analyseXhr'
import { renderContent, overlay, viewOnlyBoard, renderVariantSelector } from './view/analyseView'
import AnalyseCtrl from './AnalyseCtrl'
import { Source } from './interfaces'
import layout from '../layout'

export interface Attrs {
  id: string
  source: Source
  color?: Color
  fen?: string
  variant?: VariantKey
  ply?: string
  tab?: string
  // fen used for placeholder board while loading
  curFen?: string
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
    const tab = safeStringToNum(vnode.attrs.tab)

    const shouldGoBack = gameId !== undefined

    if (source === 'online' && gameId) {
      const now = performance.now()
      gameAnalysisXhr(gameId, orientation)
      .then(cfg => {
        const elapsed = performance.now() - now
        setTimeout(() => {
          this.ctrl = new AnalyseCtrl(cfg, source, orientation, shouldGoBack, ply, tab)
          redraw()
        }, Math.max(400 - elapsed, 0))
      })
      .catch(err => {
        handleXhrError(err)
        router.set('/analyse', true)
        redraw()
      })
    } else if (source === 'offline' && gameId === 'otb') {
      setTimeout(() => {
        const savedOtbGame = getCurrentOTBGame()
        const otbData = savedOtbGame && getAnalyseData(savedOtbGame, orientation)
        if (!otbData) {
          router.set('/analyse', true)
        } else {
          otbData.player.spectator = true
          this.ctrl = new AnalyseCtrl(otbData, source, orientation, shouldGoBack, ply, tab)
          redraw()
        }
      }, 400)
    } else if (source === 'offline' && gameId === 'ai') {
      setTimeout(() => {
        const savedAiGame = getCurrentAIGame()
        const aiData = savedAiGame && getAnalyseData(savedAiGame, orientation)
        if (!aiData) {
          router.set('/analyse', true)
        } else {
          aiData.player.spectator = true
          this.ctrl = new AnalyseCtrl(aiData, source, orientation, shouldGoBack, ply, tab)
          redraw()
        }
      }, 400)
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
        this.ctrl = new AnalyseCtrl(makeDefaultData(variant, fenArg), source, orientation, shouldGoBack, ply, tab)
        redraw()
      }
    }
  },

  oncreate(vnode) {
    if (vnode.attrs.source) {
      helper.pageSlideIn(vnode.dom as HTMLElement)
    } else {
      helper.elFadeIn(vnode.dom as HTMLElement)
    }
  },

  onremove() {
    window.plugins.insomnia.allowSleepAgain()
    socket.destroy()
    if (this.ctrl) {
      this.ctrl.unload()
      this.ctrl = undefined
    }
  },

  view(vnode) {
    const isPortrait = helper.isPortrait()

    if (this.ctrl) {

      const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'analyse', this.ctrl.settings.s.smallBoard)
      const backButton = this.ctrl.shouldGoBack ?
        renderBackbutton(h(GameTitle, { data: this.ctrl.data, subTitle: 'players' })) : null

      const title = this.ctrl.shouldGoBack ? null : h('div.main_header_title.withSub', {
        key: 'title-selector'
      }, [
        h('div', i18n('analysis')),
        renderVariantSelector(this.ctrl)
      ])

      return layout.board(
        () => header(title, backButton),
        () => renderContent(this.ctrl!, isPortrait, bounds),
        () => overlay(this.ctrl!)
      )
    } else {
      const isSmall = settings.analyse.smallBoard()
      const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'analyse', isSmall)
      return layout.board(
        loadingBackbutton,
        () => [
          viewOnlyBoard(vnode.attrs.color || 'white', bounds, isSmall, vnode.attrs.curFen || emptyFen),
          h('div.analyse-tableWrapper', spinner.getVdom('monochrome'))
        ]
      )
    }
  }
} as Mithril.Component<Attrs, State>
