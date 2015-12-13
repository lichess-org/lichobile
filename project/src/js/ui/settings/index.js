import * as utils from '../../utils';
import helper from '../helper';
import { header as headerWidget, backButton, empty } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import settings from '../../settings';
import i18n from '../../i18n';
import push from '../../push';
import m from 'mithril';

function renderBody() {
  return [
    m('ul.settings_list.general.native_scroller.page', [
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/gameDisplay'))
      }, i18n('gameDisplay')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/gameBehavior'))
      }, i18n('gameBehavior')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/lang'))
      }, i18n('language')),
      m('li.list_item.settingsChoicesInline', [
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
      m('li.list_item', formWidgets.renderCheckbox('Allow notifications', 'sound', settings.general.notifications, isOn => {
        if (isOn) push.register();
        else push.unregister();
      })),
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
