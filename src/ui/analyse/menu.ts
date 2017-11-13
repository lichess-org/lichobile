import * as h from 'mithril/hyperscript'
import router from '../../router'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import spinner from '../../spinner'
import * as gameApi from '../../lichess/game'
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
      computingPGN: false
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

  const isOfflineOrNotPlayable =
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data)

  return h('div.analyseMenu', [
     isOfflineOrNotPlayable ? h('button[data-icon=U]', {
      key: 'continueFromHere',
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.continuePopup.open(ctrl.node.fen, ctrl.data.game.variant.key, ctrl.data.player.color)
      })
    }, i18n('continueFromHere')) : null,
    isOfflineOrNotPlayable ? h('button', {
      key: 'boardEditor',
      oncreate: helper.ontap(() => router.set(`/editor/${encodeURIComponent(ctrl.node.fen)}`))
    }, [h('span.fa.fa-pencil'), i18n('boardEditor')]) : null,
    isOfflineOrNotPlayable ? h('button', {
      key: 'sharePGN',
      oncreate: sharePGN
    }, ctrl.menu.s.computingPGN ? spinner.getVdom('monochrome') : [h('span.fa.fa-share-alt'), i18n('sharePGN')]) : null,
    ctrl.data.analysis ? h('button', {
      key: 'retro',
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.toggleRetro()
      }),
      disabled: !!ctrl.retro
    }, [h('span.fa.fa-play'), 'Learn from your mistakes']) : null,
    ctrl.notes ? h('button', {
      key: 'notes',
      oncreate: helper.ontap(() => {
        if (ctrl.notes) {
          ctrl.menu.close()
          ctrl.notes.open()
        }
      })
    }, [h('span.fa.fa-pencil'), i18n('notes')]) : null
  ])
}

