import i18n from '../../i18n'
import router from '../../router'
import { validateFen, positionLooksLegit } from '../../utils/fen'
import { specialFenVariants } from '../../lichess/variant'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import playMachineForm from '../playMachineForm'
import challengeForm from '../challengeForm'
import { hasNetwork } from '../../utils'
import * as h from 'mithril/hyperscript'
import * as stream from 'mithril/stream'

export interface Controller {
  open(fentoSet: string, variantToSet: VariantKey, colorToSet?: Color): void
  close(fromBB?: string): void
  fen: Mithril.Stream<string | undefined>
  variant: Mithril.Stream<VariantKey>
  color: Mithril.Stream<Color>
  isOpen(): boolean
}

export default {

  controller() {
    let isOpen = false
    const fen: Mithril.Stream<string | undefined> = stream(undefined)
    const variant: Mithril.Stream<VariantKey> = stream('standard' as VariantKey)
    const color: Mithril.Stream<Color> = stream('white' as Color)

    function open(fentoSet: string, variantToSet: VariantKey, colorToSet: Color = 'white') {
      router.backbutton.stack.push(close)
      fen(fentoSet)
      variant(variantToSet)
      color(colorToSet)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      fen,
      variant,
      color,
      isOpen: function() {
        return isOpen
      }
    }
  },

  view(ctrl: Controller) {
    return popupWidget(
      'continueFromHere',
      () => h('h2', i18n('continueFromHere')),
      () => {
        return [
          !specialFenVariants.has(ctrl.variant()) && hasNetwork() ? h('p.sep', i18n('playOnline')) : null,
          !specialFenVariants.has(ctrl.variant()) && hasNetwork() ? h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close()
              const f = ctrl.fen()
              if (f) playMachineForm.openAIFromPosition(f)
            })
          }, i18n('playWithTheMachine')) : null,
          !specialFenVariants.has(ctrl.variant()) && hasNetwork() ? h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close()
              const f = ctrl.fen()
              if (f) challengeForm.openFromPosition(f)
            })
          }, i18n('playWithAFriend')) : null,
          h('p.sep', i18n('playOffline')),
          h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close()
              const f = ctrl.fen()
              const v = ctrl.variant()
              const c = ctrl.color()
              if (f) {
                if (validateFen(f, v) && positionLooksLegit(f)) {
                  router.set(`/ai/variant/${v}/fen/${encodeURIComponent(f)}/color/${c}`)
                } else {
                  window.plugins.toast.show('Invalid FEN', 'short', 'center')
                }
              }
            })
          }, i18n('playOfflineComputer')),
          h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close()
              const f = ctrl.fen()
              const v = ctrl.variant()
              if (f) {
                if (validateFen(f, v) && positionLooksLegit(f)) {
                  router.set(`/otb/variant/${v}/fen/${encodeURIComponent(f)}`)
                } else {
                  window.plugins.toast.show('Invalid FEN', 'short', 'center')
                }
              }
            })
          }, i18n('playOnTheBoardOffline'))
        ]
      },
      ctrl.isOpen(),
      ctrl.close
    )
  }
}
