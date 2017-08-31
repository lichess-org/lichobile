import * as stream from 'mithril/stream'
import * as h from 'mithril/hyperscript'
import router from '../../router'
import i18n from '../../i18n'
import settings from '../../settings'
import getVariant, { specialFenVariants } from '../../lichess/variant'
import formWidgets from '../shared/form'
import ViewOnlyBoard from '../shared/ViewOnlyBoard'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import { AiRoundInterface } from '../shared/round'
import { opponentSelector } from './actions'

const colors = [
  ['white', 'white'],
  ['black', 'black'],
  ['randomColor', 'random']
]

export interface NewAiGameCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: Mithril.Stream<boolean>
  root: AiRoundInterface
}

export default {

  controller(root: AiRoundInterface) {
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

  view(ctrl: NewAiGameCtrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game',
        undefined,
        function() {
          const availVariants = settings.ai.availableVariants
          const variants = ctrl.root.vm.setupFen ?
            availVariants.filter(i => !specialFenVariants.has(i[1])) :
            availVariants

          const setupVariant = settings.ai.variant()
          const hasSpecialSetup = ctrl.root.vm.setupFen && specialFenVariants.has(setupVariant)

          const settingsColor = settings.ai.color()
          const setupColor = settingsColor !== 'random' ? settingsColor : 'white'

          return (
            <div>
              <div className="action">
                {opponentSelector()}
                {sideSelector()}
                {hasSpecialSetup ?
                  <div className="select_input disabled">
                    <label for="variant">{i18n('variant')}</label>
                    <select disabled id="variant">
                      <option value={setupVariant} selected>
                        {getVariant(setupVariant).name}
                      </option>
                    </select>
                  </div> :
                  <div className="select_input">
                    {formWidgets.renderSelect('variant', 'variant', variants, settings.ai.variant)}
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
                          if (ctrl.root.vm.setupFen) router.set(`/editor/${encodeURIComponent(ctrl.root.vm.setupFen)}`)
                        })}
                      >
                        {h(ViewOnlyBoard, {
                          fen: ctrl.root.vm.setupFen,
                          orientation: setupColor,
                          bounds: { width: 130, height: 130 }
                        })}
                      </div>
                    </div>
                  </div> : null
                }
              </div>
              <div className="popupActionWrapper">
                <button className="popupAction" data-icon="E"
                  oncreate={helper.ontap(() => {
                    ctrl.root.startNewGame(settings.ai.variant() as VariantKey, ctrl.root.vm.setupFen)
                  })}>
                  {i18n('play')}
                </button>
              </div>
            </div>
          )
        },
        ctrl.isOpen(),
        () => {
          if (ctrl.root.vm.setupFen) {
            router.set('/ai')
          }
          ctrl.close()
        }
      )
    }

    return null
  }
}

function sideSelector() {
  return (
    <div className="select_input">
      {formWidgets.renderSelect('side', 'color', colors, settings.ai.color)}
    </div>
  )
}
