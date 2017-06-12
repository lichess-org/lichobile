import * as h from 'mithril/hyperscript'
import i18n from '../../i18n'
import router from '../../router'
import settings from '../../settings'
import getVariant, { specialFenVariants } from '../../lichess/variant'
import ViewOnlyBoard from '../shared/ViewOnlyBoard'
import formWidgets from '../shared/form'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import * as stream from 'mithril/stream'

import { OtbRoundInterface } from '../shared/round'

export interface NewOtbGameCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: Mithril.Stream<boolean>
  root: OtbRoundInterface
}

export default {

  controller(root: OtbRoundInterface) {
    const isOpen = stream(false)

    function open() {
      router.backbutton.stack.push(close)
      isOpen(true)
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen() === true) router.backbutton.stack.pop()
      isOpen(false)
    }

    return {
      open,
      close,
      isOpen,
      root
    }
  },

  view: function(ctrl: NewOtbGameCtrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game',
        undefined,
        function() {
          const availVariants = settings.otb.availableVariants
          const setupVariant = ctrl.root.vm.setupVariant
          const variants = ctrl.root.vm.setupFen ?
            availVariants.filter(i => !specialFenVariants.has(i[1])) :
            availVariants

          const hasSpecialSetup = setupVariant && specialFenVariants.has(setupVariant)
          if (setupVariant) {
            settings.otb.variant(setupVariant)
          }

          return (
            <div>
              <div className="action">
                {hasSpecialSetup ?
                  <div className="select_input disabled">
                    <label for="variant">{i18n('variant')}</label>
                    <select disabled id="variant">
                      <option value={setupVariant} selected>
                        {getVariant(setupVariant || 'standard' as VariantKey).name}
                      </option>
                    </select>
                  </div> :
                  <div className="select_input">
                    {formWidgets.renderSelect('variant', 'variant', variants, settings.otb.variant)}
                  </div>
                }
                { ctrl.root.vm.setupFen ?
                  <div className="from_position_wrapper">
                    <p>{i18n('fromPosition')}</p>
                    <div className="from_position">
                      <div
                        style={{
                          width: '130px',
                          height: '130px'
                        }}
                        oncreate={helper.ontap(() => {
                          if (ctrl.root.vm.setupFen)
                            router.set(`/editor/${encodeURIComponent(ctrl.root.vm.setupFen)}`)
                        })}
                      >
                        {h(ViewOnlyBoard, { fen: ctrl.root.vm.setupFen, bounds: { width: 130, height: 130 }})}
                      </div>
                    </div>
                  </div> : null
                }
              </div>
              <div className="popupActionWrapper">
                <button className="popupAction" data-icon="E"
                  oncreate={helper.ontap(() =>
                    ctrl.root.startNewGame(settings.otb.variant() as VariantKey, ctrl.root.vm.setupFen))
                  }>
                  {i18n('play')}
                </button>
              </div>
            </div>
          )
        },
        ctrl.isOpen(),
        () => {
          if (ctrl.root.vm.setupFen) {
            router.set('/otb')
          }
          ctrl.close()
        }
      )
    }

    return null
  }
}

