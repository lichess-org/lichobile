import socket from '../../socket'
import settings from '../../settings'
import { renderContent, overlay, viewOnlyBoard } from './view/analyseView'
import router from '../../router'
import redraw from '../../utils/redraw'
import { handleXhrError } from '../../utils'
import { gameAnalysis as gameAnalysisXhr } from './analyseXhr'
import i18n from '../../i18n'
import { specialFenVariants } from '../../lichess/variant'
import { emptyFen } from '../../utils/fen'
import { getAnalyseData, getCurrentAIGame, getCurrentOTBGame } from '../../utils/offlineGames'
import * as helper from '../helper'
import { makeDefaultData } from './data'
import AnalyseCtrl from './AnalyseCtrl'
import { Source } from './interfaces'
import { gameTitle, loadingBackbutton, header, backButton as renderBackbutton } from '../shared/common'
import layout from '../layout'

export interface Attrs {
  id: string
  source: Source
  color?: Color
  fen?: string
  variant?: VariantKey
  ply?: number
}

export interface State {
  ctrl?: AnalyseCtrl
}

const AnalyseScreen: Mithril.Component<Attrs, State> = {

  oninit(vnode) {
    const source = vnode.attrs.source || 'offline'
    const gameId = vnode.attrs.id
    const orientation: Color = vnode.attrs.color || 'white'
    const fenArg = vnode.attrs.fen
    const variant = vnode.attrs.variant
    const ply = vnode.attrs.ply

    const shouldGoBack = gameId !== undefined || fenArg !== undefined

    if (source === 'online' && gameId) {
      const now = performance.now()
      gameAnalysisXhr(gameId, orientation)
      .then(cfg => {
        const elapsed = performance.now() - now
        setTimeout(() => {
          this.ctrl = new AnalyseCtrl(cfg, source, orientation, shouldGoBack, ply)
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
        const otbData = savedOtbGame && getAnalyseData(savedOtbGame)
        if (!otbData) {
          router.set('/analyse', true)
        } else {
          otbData.player.spectator = true
          this.ctrl = new AnalyseCtrl(otbData, source, orientation, shouldGoBack, ply)
          redraw()
        }
      }, 400)
    } else if (source === 'offline' && gameId === 'ai') {
      setTimeout(() => {
        const savedAiGame = getCurrentAIGame()
        const aiData = savedAiGame && getAnalyseData(savedAiGame)
        if (!aiData) {
          router.set('/analyse', true)
        } else {
          aiData.player.spectator = true
          this.ctrl = new AnalyseCtrl(aiData, source, orientation, shouldGoBack, ply)
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
        this.ctrl = new AnalyseCtrl(makeDefaultData(variant, fenArg), source, orientation, shouldGoBack, ply)
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
      if (this.ctrl.ceval) this.ctrl.ceval.destroy()
      this.ctrl = undefined
    }
  },

  view(vnode) {
    const isPortrait = helper.isPortrait()

    if (this.ctrl) {

      const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'analyse', this.ctrl.vm.smallBoard)
      const backButton = this.ctrl.vm.shouldGoBack ? renderBackbutton(gameTitle(this.ctrl.data)) : null
      const title = this.ctrl.vm.shouldGoBack ? null : i18n('analysis')

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
        () => viewOnlyBoard(vnode.attrs.color || 'white', bounds, isSmall, emptyFen)
      )
    }
  }
}

export default AnalyseScreen
