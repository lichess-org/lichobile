import * as utils from '../../utils';
import widgets from '../widget/common';
import layout from '../layout';
import formWidgets from '../widget/form';
import i18n from '../../i18n';
import settings from '../../settings';

function renderBody() {
  return [
    m('div.native_scroller.page.settings_list.radio_list', [
      m('ul#pieceThemes', {}, settings.general.theme.availablePieceThemes.map(function(t) {
        return m('li.list_item.piece_theme', {
          className: t
        }, formWidgets.renderRadio(t, 'piece_theme', t,
          settings.general.theme.piece() === t,
          e => settings.general.theme.piece(e.target.value)
        ));
      }))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('pieces'))
    );
    return layout.free(header, renderBody, widgets.empty, widgets.empty);
  }
};
