import * as utils from '../../utils';
import { header as headerWidget, backButton, empty } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';
import m from 'mithril';

function renderBody() {
  const moveConfirmOpts = [
    ['never', 'never'],
    ['inCorrespondenceGames', 'correspondence'],
    ['always', 'always']
  ];
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', [
        m('div.label', i18n('moveConfirmation')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'moveConfirmation', moveConfirmOpts, settings.game.moveConfirmation))
      ])
    ])
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('gameBehavior'))
    );
    return layout.free(header, renderBody, empty, empty);
  }
};

