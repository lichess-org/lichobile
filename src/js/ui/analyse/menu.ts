import * as h from 'mithril/hyperscript'
import router from '../../router'
import redraw from '../../utils/redraw'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import spinner from '../../spinner'
import * as gameApi from '../../lichess/game'
import { handleXhrError } from '../../utils'
import { requestComputerAnalysis } from './analyseXhr'
import * as helper from '../helper'

import pgnExport from './pgnExport'
import AnalyseCtrl from './AnalyseCtrl'

export interface IMainMenuCtrl {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: AnalyseCtrl
  s: {
    computingPGN: boolean
    analysisProgress: boolean
  }
}

export default {

  controller(root: AnalyseCtrl): IMainMenuCtrl {
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
      computingPGN: false,
      analysisProgress: false
    }

    return {
      open,
      close,
      isOpen: () => isOpen,
      root,
      s
    }
  },

  view(ctrl: IMainMenuCtrl) {
    return popupWidget(
      'analyse_menu',
      undefined,
      () => renderAnalyseMenu(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderAnalyseMenu(ctrl: AnalyseCtrl) {

  const sharePGN = helper.ontap(
    () => pgnExport(ctrl),
    () => window.plugins.toast.show('Share PGN', 'short', 'bottom')
  )

  return h('div.analyseMenu', [
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? h('button[data-icon=U]', {
      key: 'continueFromHere',
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.continuePopup.open(ctrl.node.fen, ctrl.data.game.variant.key, ctrl.data.player.color)
      })
    }, i18n('continueFromHere')) : null,
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? h('button', {
      key: 'boardEditor',
      oncreate: helper.ontap(() => router.set(`/editor/${encodeURIComponent(ctrl.node.fen)}`))
    }, [h('span.fa.fa-pencil'), i18n('boardEditor')]) : null,
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? h('button', {
      key: 'sharePGN',
      oncreate: sharePGN
    }, ctrl.menu.s.computingPGN ? spinner.getVdom('monochrome') : [h('span.fa.fa-share-alt'), i18n('sharePGN')]) : null,
    ctrl.notes ? h('button', {
      key: 'notes',
      oncreate: helper.ontap(() => {
        if (ctrl.notes) {
          ctrl.menu.close()
          ctrl.notes.open()
        }
      })
    }, [h('span.fa.fa-pencil'), i18n('notes')]) : null,
    ctrl.isRemoteAnalysable() ? h('button', {
      key: 'requestAComputerAnalysis',
      oncreate: helper.ontap(() => {
        return requestComputerAnalysis(ctrl.data.game.id)
        .then(() => {
          ctrl.menu.s.analysisProgress = true
          redraw()
        })
        .catch(handleXhrError)
      })
    }, [h('span.fa.fa-bar-chart'), i18n('requestAComputerAnalysis')]) : null,
    ctrl.menu.s.analysisProgress ? h('div.analysisProgress', [
      h('span', 'Analysis in progress'),
      spinner.getVdom()
    ]) : null,
    ctrl.data.analysis ? h('button', {
      key: 'open_analysis_summary',
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.evalSummary!.open()
      })
    }, [h('span.fa.fa-line-chart'), 'Analysis summary']) : null
  ])
}

