import * as utils from '../../utils';
import widgets from '../widget/common';
import formWidgets from '../widget/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';

function renderBody() {
  return [
    m('div.native_scroller.page.settings_list.radio_list', [
      m('ul#boardThemes', settings.general.theme.availableBoardThemes.map(function(t) {
        return m('li.list_item', {}, [
          formWidgets.renderRadio(
            t[0], 'board_theme', t[1],
            settings.general.theme.board() === t[1],
            e => settings.general.theme.board(e.target.value)
          ),
          m('div.board_icon.vertical_align', {
            className: t[1]
          })
        ]);
      }))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('board'))
    );
    return layout.free(header, renderBody, widgets.empty, widgets.empty);
  }
};
