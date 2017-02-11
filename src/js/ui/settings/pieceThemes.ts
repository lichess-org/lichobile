import * as helper from '../helper';
import { dropShadowHeader, backButton } from '../shared/common';
import layout from '../layout';
import formWidgets from '../shared/form';
import i18n from '../../i18n';
import settings from '../../settings';
import * as h from 'mithril/hyperscript';

function renderBody() {
  return [
    h('div.native_scroller.page.settings_list.radio_list', [
      h('ul#pieceThemes', {}, settings.general.theme.availablePieceThemes.map(function(t) {
        return h('li.list_item.piece_theme', {
          className: t
        }, formWidgets.renderRadio(t, 'piece_theme', t,
          settings.general.theme.piece() === t,
          e => {
            settings.general.theme.piece((e.target as HTMLInputElement).value);
          }
        ));
      }))
    ])
  ];
}

export default {
  oncreate: helper.viewSlideIn,

  view: function() {
    const header = () => dropShadowHeader(null, backButton(i18n('pieces')));
    return layout.free(header, renderBody);
  }
};
