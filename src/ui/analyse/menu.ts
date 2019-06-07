import * as h from 'mithril/hyperscript'
import router from '../../router'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import spinner from '../../spinner'
import * as gameApi from '../../lichess/game'
import { isOnlineAnalyseData } from '../../lichess/interfaces/analyse'
import * as helper from '../helper'

import pgnExport from './pgnExport'
import AnalyseCtrl from './AnalyseCtrl'

export interface IMainMenuCtrl {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: AnalyseCtrl
  s: {
    showShareMenu: boolean
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
      s.showShareMenu = false
    }

    const s = {
      showShareMenu: false,
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
      () => ctrl.s.showShareMenu ? renderShareMenu(ctrl.root) : renderAnalyseMenu(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderAnalyseMenu(ctrl: AnalyseCtrl) {

  return h('div.analyseMenu', [
    h('button', {
      key: 'share',
      oncreate: helper.ontap(() => {
        ctrl.menu.s.showShareMenu = true
      })
    }, [h('span.fa.fa-share'), 'Share']),
    h('button[data-icon=B]', {
      key: 'flipBoard',
      oncreate: helper.ontap(ctrl.settings.flip)
    }, i18n('flipBoard')),
    ctrl.isOfflineOrNotPlayable() ? h('button[data-icon=U]', {
      key: 'continueFromHere',
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.continuePopup.open(ctrl.node.fen, ctrl.data.game.variant.key, ctrl.data.player.color)
      })
    }, i18n('continueFromHere')) : null,
    ctrl.isOfflineOrNotPlayable() ? h('button', {
      key: 'boardEditor',
      oncreate: helper.ontap(() => router.set(`/editor/${encodeURIComponent(ctrl.node.fen)}`))
    }, [h('span.fa.fa-pencil'), i18n('boardEditor')]) : null,
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

function renderShareMenu(ctrl: AnalyseCtrl) {
  return h('div.analyseMenu', [
    isOnlineAnalyseData(ctrl.data) ? h('button', {
      oncreate: helper.ontap(() => {
        window.plugins.socialsharing.share(null, null, null, gameApi.publicUrl(ctrl.data))
      })
    }, [i18n('shareGameURL')]) : null,
    ctrl.isOfflineOrNotPlayable() ? h('button', {
      key: 'sharePGN',
      oncreate: helper.ontap(() => {
        pgnExport(ctrl)
      }),
    }, ctrl.menu.s.computingPGN ? spinner.getVdom('monochrome') : [i18n('sharePGN')]) : null,
  ])
}
