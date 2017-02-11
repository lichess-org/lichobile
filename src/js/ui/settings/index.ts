import * as utils from '../../utils';
import router from '../../router';
import * as helper from '../helper';
import { dropShadowHeader, backButton } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import settings from '../../settings';
import session from '../../session';
import i18n from '../../i18n';
import socket from '../../socket';
import * as h from 'mithril/hyperscript';

const SettingsScreen: Mithril.Component<{}, {}> = {
  oncreate: helper.viewSlideIn,

  oninit() {
    helper.analyticsTrackView('Settings');
    socket.createDefault();
  },

  view() {
    const header = () => dropShadowHeader(null, backButton(i18n('settings')))
    return layout.free(header, renderBody);
  }
}

export default SettingsScreen

function renderBody() {
  return h('div', {
    style: { width: '100%', height: '100%' }
  }, [
    h('ul.settings_list.general.native_scroller.page', [
      utils.hasNetwork() && session.isConnected() ? h('li.list_item.nav', {
        key: 'preferences',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/preferences'))
      }, i18n('preferences')) : null,
      h('li.list_item.nav', {
        key: 'lang',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/lang'))
      }, i18n('language')),
      h('li.list_item.nav', {
        key: 'gameDisplay',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/gameDisplay'))
      }, i18n('gameDisplay')),
      h('li.list_item.nav', {
        key: 'boardTheme',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/themes/board'))
      }, `${i18n('theming')} (${i18n('board')})`),
      h('li.list_item.nav', {
        key: 'piecesTheme',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/themes/piece'))
      }, `${i18n('theming')} (${i18n('pieces')})`),
      h('li.list_item.nav', {
        key: 'soundNotifications',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/soundNotifications'))
      }, i18n('soundAndNotifications')),
      h('li.list_item.settingsChoicesInline', {
        key: 'backgroundTheme'
      }, [
        h('label', 'Background'),
        h('fieldset', [
          h('div.nice-radio', formWidgets.renderRadio(
            'Dark',
            'bgTheme',
            'dark',
            settings.general.theme.background() === 'dark',
            e => utils.autoredraw(() => {
              settings.general.theme.background((e.target as HTMLInputElement).value);
              layout.onBackgroundChange((e.target as HTMLInputElement).value);
            })
          )),
          h('div.nice-radio', formWidgets.renderRadio(
            'Light',
            'bgTheme',
            'light',
            settings.general.theme.background() === 'light',
            e => utils.autoredraw(() => {
              settings.general.theme.background((e.target as HTMLInputElement).value);
              layout.onBackgroundChange((e.target as HTMLInputElement).value);
            })
        ))])
      ]),
      h('li.list_item', {
        key: 'analytics'
      }, formWidgets.renderCheckbox(i18n('allowAnalytics'), 'analytics', settings.general.analytics))
    ]),
    window.AppVersion ? h('section.app_version', 'v' + window.AppVersion.version) : null
  ]);
}

