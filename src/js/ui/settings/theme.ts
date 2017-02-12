import { dropShadowHeader, backButton } from '../shared/common';
import redraw from '../../utils/redraw';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import * as helper from '../helper';
import * as h from 'mithril/hyperscript';

export default {
  oncreate: helper.viewSlideIn,

  view: function() {
    const header = () => dropShadowHeader(null, backButton(i18n('theming')))
    return layout.free(header, renderBody);
  }
}

function renderBody() {
  return [
    h('div.native_scroller.page.settings_list.radio_list', [
      h('ul#bgThemes', settings.general.theme.availableBackgroundThemes.map((t) => {
        return h('li.list_item', {}, [
          formWidgets.renderRadio(
            t[0], 'bg_theme', t[1],
            settings.general.theme.background() === t[1],
            e => {
              settings.general.theme.background((e.target as HTMLInputElement).value);
              layout.onBackgroundChange((e.target as HTMLInputElement).value);
              redraw();
            }
          )
        ]);
      }))
    ])
  ];
}
