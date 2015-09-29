import * as utils from '../../utils';
import { header as headerWidget, backButton, empty } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import m from 'mithril';

function renderBody() {
  const exp = 'Persistent data connection. Disable it will save battery but you won\'t be able to get friends/games updates, nor receive challenges. Only useful for screens that don\'t require an opened connection, like training or offline AI.';

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

