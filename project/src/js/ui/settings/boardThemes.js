import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import { onBoardThemeChange } from '../shared/Board';
import m from 'mithril';

function renderBody() {
  return [
    m('div.native_scroller.page.settings_list.radio_list', [
      m('ul#boardThemes', settings.general.theme.availableBoardThemes.map(function(t) {
        return m('li.list_item', {}, [
          formWidgets.renderRadio(
            t[0], 'board_theme', t[1],
            settings.general.theme.board() === t[1],
            e => {
              settings.general.theme.board(e.target.value);
              onBoardThemeChange(e.target.value);
            }
          ),
          m('div.board_icon.vertical_align', {
            className: t[1]
          })
        ]);
      }))
    ])
  ];
}

export default {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('board'))
    );
    return layout.free(header, renderBody);
  }
};
