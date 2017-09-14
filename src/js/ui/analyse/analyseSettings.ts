import * as h from 'mithril/hyperscript'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import router from '../../router'
import * as gameApi from '../../lichess/game'
import settings from '../../settings'
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
  }
  open(): void
  close(fBB?: string): void
  isOpen(): boolean
  toggleBoardSize(): void
  toggleBestMove(): void
  toggleComments(): void
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
      flip: false
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

  return h('div.analyseSettings', [
    ctrl.ceval.allowed ? h('div.action', {
      key: 'enableCeval'
    }, [
      formWidgets.renderCheckbox(
        i18n('enableLocalComputerEvaluation'), 'allowCeval', settings.analyse.enableCeval,
        v => {
          ctrl.ceval.toggle()
          if (v) ctrl.initCeval()
          else ctrl.ceval.destroy()
        }
      ),
      h('small.caution', i18n('localEvalCaution'))
    ]) : null,
    ctrl.ceval.allowed ? h('div.action', {
      key: 'showBestMove'
    }, [
      formWidgets.renderCheckbox(
        i18n('showBestMove'), 'showBestMove', settings.analyse.showBestMove,
        ctrl.settings.toggleBestMove
      )
    ]) : null,
    ctrl.source === 'online' && ctrl.data.url !== undefined && gameApi.analysable(ctrl.data) ? h('div.action', {
      key: 'showComments'
    }, [
      formWidgets.renderCheckbox(
        i18n('keyShowOrHideComments'), 'showComments', settings.analyse.showComments,
        ctrl.settings.toggleComments
      )
    ]) : null
  ])
}

