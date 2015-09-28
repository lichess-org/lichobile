import * as utils from '../../utils';
import helper from '../helper';
import { header as headerWidget, backButton, empty } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import settings from '../../settings';
import i18n from '../../i18n';
import m from 'mithril';

function renderBody() {
  return [
    m('ul.settings_list.general.native_scroller.page', [
      m('li.list_item.nav', {
        config: helper.ontouchY(m.route.bind(undefined, '/settings/game'))
      }, i18n('gameDisplay')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/network'))
      }, i18n('Network')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/lang'))
      }, i18n('language')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/board'))
      }, i18n('board')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/piece'))
      }, i18n('pieces')),
      m('li.list_item.bgTheme', [
        m('label', 'Background'),
        m('fieldset', [
          m('div.nice-radio', formWidgets.renderRadio(
            'Dark',
            'bgTheme',
            'dark',
            settings.general.theme.background() === 'dark',
            e => settings.general.theme.background(e.target.value)
          )),
          m('div.nice-radio', formWidgets.renderRadio(
            'Light',
            'bgTheme',
            'light',
            settings.general.theme.background() === 'light',
            e => settings.general.theme.background(e.target.value)
        ))])
      ]),
      m('li.list_item', formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('allowAnalytics'), 'sound', settings.general.analytics))
    ]),
    window.lichess.version ? m('section.app_version', 'v' + window.lichess.version) : null
  ];
}

module.exports = {
  controller: function() {
    helper.analyticsTrackView('Settings');
  },

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('settings'))
    );
    return layout.free(header, renderBody, empty, empty);
  }
};
