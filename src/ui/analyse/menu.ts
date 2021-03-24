import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import router from '../../router'
import i18n from '../../i18n'
import session from '../../session'
import * as chess from '../../chess'
import redraw from '../../utils/redraw'
import { handleXhrError  } from '../../utils'
import popupWidget from '../shared/popup'
import spinner from '../../spinner'
import * as gameApi from '../../lichess/game'
import { isOnlineAnalyseData } from '../../lichess/interfaces/analyse'
import { getPGN } from '../shared/round/roundXhr'
import * as helper from '../helper'

import AnalyseCtrl from './AnalyseCtrl'

export interface IMainMenuCtrl {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: AnalyseCtrl
  s: {
    showShareMenu: boolean
    computingPGN: boolean
    computingPGNAnnotated: boolean
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
      computingPGN: false,
      computingPGNAnnotated: false,
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

  return h('div.analyseMenu', h.fragment({ key: 'analyseMenu' }, [
    h('button', {
      oncreate: helper.ontap(() => {
        ctrl.menu.s.showShareMenu = true
      })
    }, [h('span.fa.fa-share'), i18n('shareAndExport')]),
    ctrl.isOfflineOrNotPlayable() ? h('button[data-icon=U]', {
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.continuePopup.open(ctrl.node.fen, ctrl.data.game.variant.key, ctrl.data.player.color)
      })
    }, i18n('continueFromHere')) : null,
    ctrl.isOfflineOrNotPlayable() ? h('button', {
      oncreate: helper.ontap(() => router.set(`/editor/${encodeURIComponent(ctrl.node.fen)}`))
    }, [h('span.fa.fa-pencil'), i18n('boardEditor')]) : null,
    ctrl.data.analysis ? h('button', {
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.toggleRetro()
      }),
      disabled: !!ctrl.retro
    }, [h('span.fa.fa-play'), i18n('learnFromYourMistakes')]) : null,
    ctrl.ceval.allowed ? h('button', {
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.togglePractice()
      }),
    }, [h('span.fa.fa-bullseye'), i18n('practiceWithComputer')]) : null,
    ctrl.notes ? h('button', {
      oncreate: helper.ontap(() => {
        if (ctrl.notes) {
          ctrl.menu.close()
          ctrl.notes.open()
        }
      })
    }, [h('span.fa.fa-pencil'), i18n('notes')]) : null
  ]))
}

function renderShareMenu(ctrl: AnalyseCtrl) {
  return h('div.analyseMenu', h.fragment({ key: 'shareMenu' }, [
    isOnlineAnalyseData(ctrl.data) ? h('button', {
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        Plugins.LiShare.share({ url: gameApi.publicAnalyseUrl(ctrl.data) })
      })
    }, [i18n('shareGameURL')]) : null,
    ctrl.source === 'offline' ? h('button', {
      oncreate: helper.ontap(() => {
        offlinePgnExport(ctrl)
      }),
    }, ctrl.menu.s.computingPGN ? spinner.getVdom('monochrome') : [i18n('sharePGN')]) : null,
    ctrl.source === 'online' && !gameApi.playable(ctrl.data) ? h('button', {
      oncreate: helper.ontap(() => {
        onlinePGNExport(ctrl, false)
      }),
    }, ctrl.menu.s.computingPGNAnnotated ? spinner.getVdom('monochrome') : 'Share annotated PGN') : null,
    ctrl.source === 'online' && !gameApi.playable(ctrl.data) ? h('button', {
      oncreate: helper.ontap(() => {
        onlinePGNExport(ctrl, true)
      }),
    }, ctrl.menu.s.computingPGN ? spinner.getVdom('monochrome') : 'Share raw PGN') : null,
    ctrl.isOfflineOrNotPlayable() ? h('button', {
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        Plugins.LiShare.share({ text: ctrl.node.fen })
      }),
    }, 'Share current FEN') : null,
  ]))
}

function onlinePGNExport(ctrl: AnalyseCtrl, raw: boolean) {
  if ((raw && !ctrl.menu.s.computingPGN) || (!raw && !ctrl.menu.s.computingPGNAnnotated)) {
    if (raw) ctrl.menu.s.computingPGN = true
    else ctrl.menu.s.computingPGNAnnotated = true
    getPGN(ctrl.data.game.id, raw)
    .then((pgn: string) => {
      ctrl.menu.s.computingPGN = false
      ctrl.menu.s.computingPGNAnnotated = false
      ctrl.menu.close()
      redraw()
      Plugins.LiShare.share({ text: pgn })
    })
    .catch(e => {
      ctrl.menu.s.computingPGN = false
      ctrl.menu.s.computingPGNAnnotated = false
      redraw()
      handleXhrError(e)
    })
  }
}

function offlinePgnExport(ctrl: AnalyseCtrl) {
  if (!ctrl.menu.s.computingPGN) {
    ctrl.menu.s.computingPGN = true
    const endSituation = ctrl.tree.lastNode()
    const white = ctrl.data.player.color === 'white' ?
    (ctrl.data.game.id === 'offline_ai' ? session.appUser('Anonymous') : 'Anonymous') :
    (ctrl.data.game.id === 'offline_ai' ? ctrl.data.opponent.username : 'Anonymous')
    const black = ctrl.data.player.color === 'black' ?
    (ctrl.data.game.id === 'offline_ai' ? session.appUser('Anonymous') : 'Anonymous') :
    (ctrl.data.game.id === 'offline_ai' ? ctrl.data.opponent.username : 'Anonymous')
    chess.pgnDump({
      variant: ctrl.data.game.variant.key,
      initialFen: ctrl.data.game.initialFen,
      pgnMoves: endSituation.pgnMoves || [],
      white,
      black
    })
    .then((res: chess.PgnDumpResponse) => {
      ctrl.menu.s.computingPGN = false
      ctrl.menu.close()
      redraw()
      Plugins.LiShare.share({ text: res.pgn })
    })
    .catch(e => {
      ctrl.menu.s.computingPGN = false
      redraw()
      console.error(e)
    })
  }
}
