import router from '../../router'
import * as helper from '../helper'
import { dropShadowHeader, backButton } from '../shared/common'
import layout from '../layout'
import i18n from '../../i18n'
import socket from '../../socket'
import * as h from 'mithril/hyperscript'

const SettingsScreen: Mithril.Component<{}, {}> = {
  oncreate: helper.viewSlideIn,

  oninit() {
    socket.createDefault()
  },

  view() {
    const header = dropShadowHeader(null, backButton(i18n('settings')))
    return layout.free(header, renderBody())
  }
}

export default SettingsScreen

function renderBody() {
  return [
    h('ul.settings_list.native_scroller.page', [
      h('li.list_item.nav', {
        key: 'gameDisplay',
        oncreate: helper.ontapY(() => router.set('/settings/gameDisplay'))
      }, i18n('gameDisplay')),
      h('li.list_item.nav', {
        oncreate: helper.ontapY(() => router.set('/settings/gameBehavior'))
      }, i18n('gameBehavior')),
      h('li.list_item.nav', {
        key: 'lang',
        oncreate: helper.ontapY(() => router.set('/settings/lang'))
      }, i18n('language')),
      h('li.list_item.nav', {
        key: 'theme',
        oncreate: helper.ontapY(() => router.set('/settings/theme'))
      }, `${i18n('theming')}`),
      h('li.list_item.nav', {
        key: 'boardTheme',
        oncreate: helper.ontapY(() => router.set('/settings/themes/board'))
      }, i18n('board')),
      h('li.list_item.nav', {
        key: 'piecesTheme',
        oncreate: helper.ontapY(() => router.set('/settings/themes/piece'))
      }, i18n('pieces')),
      h('li.list_item.nav', {
        key: 'soundNotifications',
        oncreate: helper.ontapY(() => router.set('/settings/soundNotifications'))
      }, i18n('soundAndNotifications'))
    ]),
    window.AppVersion ? h('section.app_version', 'v' + window.AppVersion.version) : null
  ]
}
