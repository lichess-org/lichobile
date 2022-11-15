import h from 'mithril/hyperscript'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import layout from '../layout'
import i18n from '../../i18n'
import settings from '../../settings'
import bluetooth from '../../externalDevice/bluetooth'

function renderBody() {
  return h('ul.native_scroller.page.settings_list.game', [
    h('li.list_item', {
    }, formWidgets.renderCheckbox(i18n('useBluetoothDevice'), 'bluetooth', settings.general.bluetooth.useDevice, bluetooth.onSettingChange))
  ])
}

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('bluetooth')))
    return layout.free(header, renderBody())
  }
}
