import { dropShadowHeader, backButton, onBoardThemeChange } from '../shared/common';
import redraw from '../../utils/redraw';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import * as helper from '../helper';
import * as h from 'mithril/hyperscript';

function renderBody() {
  return [
    h('div.native_scroller.page.settings_list.radio_list', [
      h('ul#boardThemes', settings.general.theme.availableBoardThemes.map((t) => {
        return h('li.list_item', {}, [
          formWidgets.renderRadio(
            t[0], 'board_theme', t[1],
            settings.general.theme.board() === t[1],
            e => {
              settings.general.theme.board((e.target as HTMLInputElement).value);
              onBoardThemeChange((e.target as HTMLInputElement).value);
              redraw();
            }
          ),
          h('div.board_icon.vertical_align', {
            className: t[1]
          })
        ]);
      }))
    ])
  ];
}

export default {
  oncreate: helper.viewSlideIn,

  view: function() {
    const header = () => dropShadowHeader(null, backButton(i18n('board')))
    return layout.free(header, renderBody);
  }
}
