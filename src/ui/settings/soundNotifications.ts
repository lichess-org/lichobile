import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import Checkbox from '../shared/form/Checkbox'
import layout from '../layout'
import push from '../../push'
import i18n from '../../i18n'
import settings from '../../settings'
import sound from '../../sound'
import vibrate from '../../vibrate'
import h from 'mithril/hyperscript'

function renderBody() {
  return h('ul.native_scroller.page.settings_list.game', [
    h('li.list_item', h(Checkbox, {
      label: i18n('toggleSound'),
      name: 'sound',
      prop: settings.general.sound,
      callback: sound.onSettingChange
    })),
    h('li.list_item', {
    }, formWidgets.renderCheckbox(i18n('vibrateOnGameEvents'), 'vibrate', settings.general.vibrateOnGameEvents, vibrate.onSettingChange)),
    h('li.list_item', formWidgets.renderCheckbox(i18n('notifications'), 'notifications', settings.general.notifications.allow, isOn => {
      if (isOn) {
        push.register()
      } else {
        push.unregister()
      }
    })),
  ])
}

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const header = dropShadowHeader(null, backButton(i18n('sound') + ' | ' + i18n('notifications')))
    return layout.free(header, renderBody())
  }
}
