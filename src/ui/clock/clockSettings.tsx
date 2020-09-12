import h from 'mithril/hyperscript'
import { Plugins } from '@capacitor/core'
import { Prop } from '~/utils'
import redraw from '../../utils/redraw'
import settings from '../../settings'
import formWidgets from '../shared/form'
import popupWidget from '../shared/popup'
import * as helper from '../helper'
import router from '../../router'
import { IChessClock } from '../shared/clock/interfaces'
import { clockSettingsView } from '../shared/clock/utils'

interface IClockSettingsCtrl {
  open(): void
  close(fromBB?: string): void
  isOpen(): boolean
  reload(): void
}

export default {

  controller(reload: () => void, clockObj: Prop<IChessClock>): IClockSettingsCtrl {
    let isOpen = false

    function open() {
      if (clockObj().isRunning() && !clockObj().flagged()) return

      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen
      },
      reload
    }
  },

  view(ctrl: IClockSettingsCtrl) {

    if (ctrl.isOpen()) {
      return popupWidget(
        'new_offline_game clock_settings',
        undefined,
        function() {
          return (
            <div>
              <div className="action">
                <div className="select_input">
                  {formWidgets.renderSelect('Clock', 'clock', settings.clock.availableClocks, settings.clock.clockType, false, onChange)}
                </div>
                {clockSettingsView(settings.clock.clockType(), onChange)}
              </div>
              <button className="newClockButton" data-icon="E" oncreate={helper.ontap(function () {
                  ctrl.reload()
                  ctrl.close()
                })}>
                Set Clock
              </button>
            </div>
          )
        },
        ctrl.isOpen(),
        ctrl.close
      )
    }

    return null
  }
}

function onChange () {
  Plugins.StatusBar.hide()
  redraw()
}
