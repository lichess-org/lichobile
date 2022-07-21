import h from 'mithril/hyperscript'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import formWidgets from '../shared/form'
import Checkbox from '../shared/form/Checkbox'
import layout from '../layout'
import push from '../../push'
import i18n from '../../i18n'
import settings from '../../settings'
import vibrate from '../../vibrate'

function renderBody() {
  return h('ul.native_scroller.page.settings_list.game', [
    h('li.list_item', h(Checkbox, {
      label: i18n('toggleSound'),
      name: 'sound',
      prop: settings.general.sound,
    })),
    h('li.list_item', {
    }, formWidgets.renderCheckbox(i18n('vibrateOnGameEvents'), 'vibrate', settings.general.vibrateOnGameEvents, vibrate.onSettingChange)),
    ...(push.isStub ? [] : [
      h(
        'li.list_item',
        formWidgets.renderCheckbox(
          i18n('notifications'),
          'notifications',
          settings.general.notifications.enable,
          isOn => {
            if (isOn) {
              push.register()
            } else {
              push.unregister()
            }
          }
        ),
      ),
    ]),
  ])
}

export default {
  oncreate: helper.viewSlideIn,

  view() {
    const headerTitle = i18n('sound') + (push.isStub ? '' : ' | ' + i18n('notifications'))
    const header = dropShadowHeader(null, backButton(headerTitle))
    return layout.free(header, renderBody())
  }
}
