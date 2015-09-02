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
      m('li.list_item', formWidgets.renderCheckbox(i18n('boardCoordinates'), 'coords', settings.general.coords)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.general.animations)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.general.pieceDestinations)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('allowAnalytics'), 'sound', settings.general.analytics)),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/lang'))
      }, i18n('language')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/board'))
      }, i18n('board')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/piece'))
      }, i18n('pieces'))
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
