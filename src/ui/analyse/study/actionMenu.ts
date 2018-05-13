import * as h from 'mithril/hyperscript'
import router from '../../../router'
import redraw from '../../../utils/redraw'
import { ErrorResponse } from '../../../http'
import { handleXhrError  } from '../../../utils'
import i18n from '../../../i18n'
import popupWidget from '../../shared/popup'
import spinner from '../../../spinner'
import * as helper from '../../helper'
import { studyPGN, studyChapterPGN } from '../../study/studyXhr'
import startTour from '../../study/study/tour'

import AnalyseCtrl from '../AnalyseCtrl'

export interface IActionMenuCtrl {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: AnalyseCtrl
  s: {
    showShareMenu: boolean
    loadingStudyPGN: boolean
    loadingChapterPGN: boolean
  }
}

export default {

  controller(root: AnalyseCtrl): IActionMenuCtrl {
    let isOpen = false

    const s = {
      showShareMenu: false,
      loadingStudyPGN: false,
      loadingChapterPGN: false,
    }

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
      s.showShareMenu = false
    }

    return {
      open,
      close,
      isOpen: () => isOpen,
      root,
      s
    }
  },

  view(ctrl: IActionMenuCtrl) {
    return popupWidget(
      'analyse_menu',
      undefined,
      () => ctrl.s.showShareMenu ? renderShareMenu(ctrl.root) : renderStudyMenu(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

const baseUrl = 'https://lichess.org/'

function renderStudyMenu(ctrl: AnalyseCtrl) {

  return h('div.analyseMenu', [
     h('button[data-icon=U]', {
      key: 'continueFromHere',
      oncreate: helper.ontap(() => {
        ctrl.menu.close()
        ctrl.continuePopup.open(ctrl.node.fen, ctrl.data.game.variant.key, ctrl.data.player.color)
      })
    }, i18n('continueFromHere')),
    h('button', {
      key: 'boardEditor',
      oncreate: helper.ontap(() => router.set(`/editor/${encodeURIComponent(ctrl.node.fen)}`))
    }, [h('span.fa.fa-pencil'), i18n('boardEditor')]),
    h('button', {
      key: 'share',
      oncreate: helper.ontap(() => {
        ctrl.study!.actionMenu.s.showShareMenu = true
      })
    }, [h('span.fa.fa-share'), 'Share']),
    h('button', {
      key: 'like',
      oncreate: helper.ontap(ctrl.study!.toggleLike)
    }, [
      h.trust('&nbsp;'),
      h('span.fa', {
        className: ctrl.study!.data.liked ? 'fa-heart' : 'fa-heart-o'
      }),
      `Like (${ctrl.study!.data.likes})`
    ]),
    h('button', {
      key: 'help',
      oncreate: helper.ontap(() => {
        ctrl.study!.actionMenu.close()
        startTour()
      }),
    }, [
    h('span.fa.fa-question-circle'),
    'Help'
    ]),
  ])
}

function renderShareMenu(ctrl: AnalyseCtrl) {

  function onPgnSuccess(pgn: string) {
    ctrl.study!.actionMenu.s.loadingChapterPGN = false
    ctrl.study!.actionMenu.s.loadingStudyPGN = false
    redraw()
    window.plugins.socialsharing.share(pgn)
  }

  function onPgnError(e: ErrorResponse) {
    ctrl.study!.actionMenu.s.loadingChapterPGN = false
    ctrl.study!.actionMenu.s.loadingStudyPGN = false
    redraw()
    handleXhrError(e)
  }

  return h('div.analyseMenu', [
    h('button', {
      oncreate: helper.ontap(() => {
        const url = baseUrl + `study/${ctrl.study!.data.id}`
        window.plugins.socialsharing.share(null, null, null, url)
      })
    }, [h('span.fa.fa-link'), i18n('Study URL')]),
    h('button', {
      oncreate: helper.ontap(() => {
        const url = baseUrl + `study/${ctrl.study!.data.id}/${ctrl.study!.data.chapter.id}`
        window.plugins.socialsharing.share(null, null, null, url)
      })
    }, [h('span.fa.fa-link'), i18n('Current chapter URL')]),
    h('button', {
      oncreate: helper.ontap(() => {
        ctrl.study!.actionMenu.s.loadingStudyPGN = true
        studyPGN(ctrl.study!.data.id)
        .then(onPgnSuccess)
        .catch(onPgnError)
      })
    }, ctrl.study!.actionMenu.s.loadingStudyPGN ? spinner.getVdom('monochrome') : [h('span.fa.fa-download'), i18n('Study PGN')]),
    h('button', {
      oncreate: helper.ontap(() => {
        ctrl.study!.actionMenu.s.loadingChapterPGN = true
        studyChapterPGN(ctrl.study!.data.id, ctrl.study!.data.chapter.id)
        .then(onPgnSuccess)
        .catch(onPgnError)
      })
    }, ctrl.study!.actionMenu.s.loadingChapterPGN ? spinner.getVdom('monochrome') : [h('span.fa.fa-download'), i18n('Chapter PGN')]),
  ])
}
