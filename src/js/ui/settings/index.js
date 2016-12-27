import * as utils from '../../utils';
import router from '../../router';
import * as helper from '../helper';
import { header as headerWidget, backButton } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import settings from '../../settings';
import session from '../../session';
import i18n from '../../i18n';
import socket from '../../socket';
import * as m from 'mithril';
import * as xhr from '../../xhr';

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    helper.analyticsTrackView('Settings');
    socket.createDefault();
  },

  view() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('settings'))
    );
    return layout.free(header, renderBody);
  }
};

function renderBody() {
  return m('div', {
    style: { width: '100%', height: '100%' }
  }, [
    m('ul.settings_list.general.native_scroller.page', [
      utils.hasNetwork() && session.isConnected() ? m('li.list_item.nav', {
        key: 'preferences',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/preferences'))
      }, i18n('preferences')) : null,
      m('li.list_item.nav', {
        key: 'lang',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/lang'))
      }, i18n('language')),
      m('li.list_item.nav', {
        key: 'gameDisplay',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/gameDisplay'))
      }, i18n('gameDisplay')),
      m('li.list_item.nav', {
        key: 'boardTheme',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/themes/board'))
      }, `${i18n('theming')} (${i18n('board')})`),
      m('li.list_item.nav', {
        key: 'piecesTheme',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/themes/piece'))
      }, `${i18n('theming')} (${i18n('pieces')})`),
      m('li.list_item.nav', {
        key: 'soundNotifications',
        oncreate: helper.ontapY(utils.f(router.set, '/settings/soundNotifications'))
      }, i18n('soundAndNotifications')),
      m('li.list_item.settingsChoicesInline', {
        key: 'backgroundTheme'
      }, [
        m('label', 'Background'),
        m('fieldset', [
          m('div.nice-radio', formWidgets.renderRadio(
            'Dark',
            'bgTheme',
            'dark',
            settings.general.theme.background() === 'dark',
            e => utils.autoredraw(() => {
              settings.general.theme.background(e.target.value);
              layout.onBackgroundChange(e.target.value);
            })
          )),
          m('div.nice-radio', formWidgets.renderRadio(
            'Light',
            'bgTheme',
            'light',
            settings.general.theme.background() === 'light',
            e => utils.autoredraw(() => {
              settings.general.theme.background(e.target.value);
              layout.onBackgroundChange(e.target.value);
            })
        ))])
      ]),
      m('li.list_item', {
        key: 'analytics'
      }, formWidgets.renderCheckbox(i18n('allowAnalytics'), 'analytics', settings.general.analytics)),
      m('li.list_item.nav', {
        key: 'patron',
        oncreate: helper.ontapY(xhr.openWebsitePatronPage)
      }, m('span.menuPatron', 'Become a Patron'))
    ]),
    window.AppVersion ? m('section.app_version', 'v' + window.AppVersion.version) : null
  ]);
}
