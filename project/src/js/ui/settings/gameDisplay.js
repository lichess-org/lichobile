import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import m from 'mithril';

function renderBody() {
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', formWidgets.renderCheckbox(i18n('boardCoordinates'), 'coords', settings.game.coords)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.game.animations)),
      m('li.list_item', formWidgets.renderCheckbox('Magnified dragged piece', 'magnified',
        settings.game.magnified)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('boardHighlights'), 'highlights',
        settings.game.highlights)),
      m('li.list_item', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.game.pieceDestinations))
    ])
  ];
}

export default {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('gameDisplay'))
    );
    return layout.free(header, renderBody);
  }
};

