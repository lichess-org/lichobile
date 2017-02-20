import * as helper from '../helper';
import { dropShadowHeader, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import * as h from 'mithril/hyperscript';

function renderBody() {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderCheckbox(i18n('boardCoordinates'), 'coords', settings.game.coords)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.game.animations)),
      h('li.list_item', formWidgets.renderCheckbox('Magnified dragged piece', 'magnified',
        settings.game.magnified)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('boardHighlights'), 'highlights',
        settings.game.highlights)),
      h('li.list_item', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.game.pieceDestinations)),
      h('li.list_item', formWidgets.renderCheckbox('Use piece symbols in move list', 'pieceNotation',
        settings.game.pieceNotation))
    ])
  ];
}

export default {
  oncreate: helper.viewSlideIn,

  view: function() {
    const header = () => dropShadowHeader(null, backButton(i18n('gameDisplay')));
    return layout.free(header, renderBody);
  }
}
