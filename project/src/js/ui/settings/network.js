import * as utils from '../../utils';
import { header as headerWidget, backButton, empty } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import m from 'mithril';

function renderBody() {
  const exp = 'Persistent data connection. Disable it to save battery (you won\'t get friends or games updates). Does not apply where connection is required, like while seeking or playing a game.';
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', formWidgets.renderCheckbox(exp, 'data', settings.general.data))
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('Network'))
    );
    return layout.free(header, renderBody, empty, empty);
  }
};

