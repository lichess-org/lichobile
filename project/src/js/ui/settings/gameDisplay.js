import * as utils from '../../utils';
import { header as headerWidget, backButton, empty } from '../shared/common';
import helper from '../helper';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import m from 'mithril';

function renderBody() {
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/board'))
      }, i18n('board')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/themes/piece'))
      }, i18n('pieces')),
      m('li.list_item', formWidgets.renderCheckbox(i18n('boardCoordinates'), 'coords', settings.game.coords)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.game.animations)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.game.pieceDestinations))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('gameDisplay'))
    );
    return layout.free(header, renderBody, empty, empty);
  }
};

