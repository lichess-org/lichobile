import * as utils from '../../utils';
import helper from '../helper';
import { header as headerWidget, backButton } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import settings from '../../settings';
import session from '../../session';
import i18n from '../../i18n';
import socket from '../../socket';
import m from 'mithril';

export default {
  controller() {
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
        config: helper.ontouchY(utils.f(m.route, '/settings/preferences'))
      }, i18n('preferences')) : null,
      m('li.list_item.nav', {
        key: 'lang',
        config: helper.ontouchY(utils.f(m.route, '/settings/lang'))
      }, i18n('language')),
      m('li.list_item.nav', {
        key: 'gameDisplay',
        config: helper.ontouchY(utils.f(m.route, '/settings/gameDisplay'))
      }, i18n('gameDisplay')),
      m('li.list_item.nav', {
        key: 'boardTheme',
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/board'))
      }, `${i18n('theming')} (${i18n('board')})`),
      m('li.list_item.nav', {
        key: 'piecesTheme',
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/piece'))
      }, `${i18n('theming')} (${i18n('pieces')})`),
      m('li.list_item.nav', {
        key: 'soundNotifications',
        config: helper.ontouchY(utils.f(m.route, '/settings/soundNotifications'))
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
            e => {
              settings.general.theme.background(e.target.value);
              layout.onBackgroundChange(e.target.value);
            }
          )),
          m('div.nice-radio', formWidgets.renderRadio(
            'Light',
            'bgTheme',
            'light',
            settings.general.theme.background() === 'light',
            e => {
              settings.general.theme.background(e.target.value);
              layout.onBackgroundChange(e.target.value);
            }
        ))])
      ]),
      m('li.list_item', {
        key: 'analytics'
      }, formWidgets.renderCheckbox(i18n('allowAnalytics'), 'analytics', settings.general.analytics))
    ]),
    window.lichess.version ? m('section.app_version', 'v' + window.lichess.version) : null
  ]);
}

