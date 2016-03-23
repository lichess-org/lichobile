import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import i18n from '../../i18n';
import settings from '../../settings';
import { onPieceThemeChange } from '../round/view/roundView';
import m from 'mithril';

function renderBody() {
  return [
    m('div.native_scroller.page.settings_list.radio_list', [
      m('ul#pieceThemes', {}, settings.general.theme.availablePieceThemes.map(function(t) {
        return m('li.list_item.piece_theme', {
          className: t
        }, formWidgets.renderRadio(t, 'piece_theme', t,
          settings.general.theme.piece() === t,
          e => {
            settings.general.theme.piece(e.target.value);
            onPieceThemeChange(e.target.value);
          }
        ));
      }))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('pieces'))
    );
    return layout.free(header, renderBody);
  }
};
