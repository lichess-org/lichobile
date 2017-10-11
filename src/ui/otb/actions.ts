import * as h from 'mithril/hyperscript'
import i18n from '../../i18n'
import redraw from '../../utils/redraw'
import settings from '../../settings'
import formWidgets from '../shared/form'
import { renderClaimDrawButton, renderEndedGameStatus } from '../shared/offlineRound/view'
import ground from '../shared/offlineRound/ground'
import popupWidget from '../shared/popup'
import router from '../../router'
import * as cg from '../../chessground/interfaces'

import OtbRound from './OtbRound'

export interface OtbActionsCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  root: OtbRound
}

function renderAlways(ctrl: OtbRound) {
  return [
    h('div.action', [
      h('div.select_input', [
        h('label', {
          'for': 'select_otb_flip_mode'
        }, 'Flip Mode'),
        h('select', {
          id: 'select_otb_flip_mode',
          value: settings.otb.flipMode(),
          onchange(e: Event) {
            let mode = (e.target as HTMLInputElement).value as cg.OtbFlipMode
            settings.otb.flipMode(mode)
            ground.setOtbFlipMode(ctrl.chessground, mode)
          }
       }, [
          h('option[value=flipPieces]', {
            value: 'flipPieces',
            selected: settings.otb.flipMode() === 'flipPieces'
          }, i18n('Flip pieces after move')),
          h('option[value=flipBoard]', {
            value: 'flipBoard',
            selected: settings.otb.flipMode() === 'flipBoard'
          }, i18n('Flip board after move')),
          h('option[value=none]',{
            value: 'none',
            selected: settings.otb.flipMode() === 'none'
          }, i18n('None'))
        ])
      ])
    ]),
    h('div.action', formWidgets.renderCheckbox(
      i18n('Use Symmetric pieces'), 'useSymmetric', settings.otb.useSymmetric, redraw
    ))
  ]
}

export default {

  controller(root: OtbRound) {
    let isOpen = false

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen
      },
      root: root
    }
  },

  view: function(ctrl: OtbActionsCtrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'offline_actions',
        undefined,
        function() {
          return [
            renderEndedGameStatus(ctrl.root)
          ].concat(
            renderClaimDrawButton(ctrl.root),
            renderAlways(ctrl.root)
          )
        },
        ctrl.isOpen(),
        ctrl.close
      )
    }

    return null
  }
}
