import h from 'mithril/hyperscript'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import router from '../../router'
import * as gameApi from '../../lichess/game'
import { isOnlineAnalyseData } from '../../lichess/interfaces/analyse'
import settings from '../../settings'
import { getNbCores } from '../../stockfish'
import { oppositeColor } from '../../utils'
import formWidgets from '../shared/form'
import AnalyseCtrl from './AnalyseCtrl'

export interface ISettingsCtrl {
  root: AnalyseCtrl
  s: {
    smallBoard: boolean
    showBestMove: boolean
    showComments: boolean
    flip: boolean
    cevalMultiPvs: number
    cevalCores: number
    cevalInfinite: boolean
  }
  open(): void
  close(fBB?: string): void
  isOpen(): boolean
  toggleBoardSize(): void
  toggleBestMove(): void
  toggleComments(): void
  cevalSetMultiPv(pv: number): void
  cevalSetCores(c: number): void
  cevalToggleInfinite(): void
  flip(): void
}

export default {

  controller(root: AnalyseCtrl): ISettingsCtrl {
    let isOpen = false

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    const s = {
      smallBoard: settings.analyse.smallBoard(),
      showBestMove: settings.analyse.showBestMove(),
      showComments: settings.analyse.showComments(),
      flip: false,
      cevalMultiPvs: settings.analyse.cevalMultiPvs(),
      cevalCores: settings.analyse.cevalCores(),
      cevalInfinite: settings.analyse.cevalInfinite()
    }

    return {
      root,
      open,
      close,
      isOpen: () => isOpen,
      s,
      toggleBoardSize() {
        const newVal = !s.smallBoard
        settings.analyse.smallBoard(newVal)
        s.smallBoard = newVal
      },
      toggleBestMove() {
        const newVal = !s.showBestMove
        settings.analyse.showBestMove(newVal)
        s.showBestMove = newVal
      },
      toggleComments() {
        const newVal = !s.showComments
        settings.analyse.showComments(newVal)
        s.showComments = newVal
      },
      flip() {
        s.flip = !s.flip
        root.chessground.set({
          orientation: s.flip ? oppositeColor(root.orientation) : root.orientation
        })
        if (root.retro) root.toggleRetro()
        if (root.practice) root.restartPractice()
      },
      cevalSetMultiPv(pv: number) {
        settings.analyse.cevalMultiPvs(pv)
        s.cevalMultiPvs = pv
        root.ceval.setMultiPv(pv)
      },
      cevalSetCores(c: number) {
        settings.analyse.cevalCores(c)
        s.cevalCores = c
        root.ceval.setCores(c)
      },
      cevalToggleInfinite() {
        s.cevalInfinite = !s.cevalInfinite
        settings.analyse.cevalInfinite(s.cevalInfinite)
        root.ceval.toggleInfinite()
      }
    }
  },

  view(ctrl: ISettingsCtrl) {
    return popupWidget(
      'analyse_menu',
      undefined,
      () => renderAnalyseSettings(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderAnalyseSettings(ctrl: AnalyseCtrl) {

  const cores = getNbCores()

  return h('div.analyseSettings', [
    h('div.action', {
      className: !ctrl.ceval.allowed || !!ctrl.retro ? 'disabled' : ''
    }, [
      formWidgets.renderCheckbox(
        i18n('toggleLocalEvaluation'), 'allowCeval', settings.analyse.enableCeval,
        v => {
          ctrl.ceval.toggle()
          if (v) ctrl.initCeval()
          else {
            ctrl.ceval.destroy()
            ctrl.resetTabs()
            if (ctrl.retro) {
              ctrl.retro.close()
              ctrl.retro = null
            }
          }
        },
        !ctrl.ceval.allowed || !!ctrl.retro,
      ),
      h('small.caution', i18n('localEvalCaution'))
    ]),
    ctrl.study || ctrl.ceval.allowed ? h('div.action', [
      formWidgets.renderCheckbox(
        i18n('bestMoveArrow'), 'showBestMove', settings.analyse.showBestMove,
        ctrl.settings.toggleBestMove
      )
    ]) : null,
    ctrl.study || (ctrl.source === 'online' && isOnlineAnalyseData(ctrl.data) && gameApi.analysable(ctrl.data)) ? h('div.action', [
      formWidgets.renderCheckbox(
        i18n('keyShowOrHideComments'), 'showComments', settings.analyse.showComments,
        ctrl.settings.toggleComments
      )
    ]) : null,
    h('div.action', [
      formWidgets.renderCheckbox(
        i18n('infiniteAnalysis'), 'ceval.infinite', settings.analyse.cevalInfinite,
        ctrl.settings.cevalToggleInfinite,
        !ctrl.ceval.allowed
      ),
    ]),
    h('div.action', [
      formWidgets.renderSlider(
        i18n('multipleLines'), 'ceval.multipv', 1, 5, 1, settings.analyse.cevalMultiPvs,
        ctrl.settings.cevalSetMultiPv,
        !ctrl.ceval.allowed
      )
    ]),
    cores > 1 ? h('div.action', [
      formWidgets.renderSlider(
        i18n('cpus'), 'ceval.cores', 1, cores, 1, settings.analyse.cevalCores,
        ctrl.settings.cevalSetCores,
        !ctrl.ceval.allowed,
      )
    ]) : null
  ])
}

