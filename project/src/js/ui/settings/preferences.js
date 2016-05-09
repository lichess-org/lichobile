import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import helper from '../helper';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';

function renderBody() {
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/gameBehavior'))
      }, i18n('gameBehavior')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/privacy'))
      }, i18n('privacy')),
      m('li.list_item.nav', {
        config: helper.ontouchY(utils.f(m.route, '/settings/kidMode'))
      }, 'Kid mode')
    ])
  ];
}

export default {
  controller: function() {},

  view: function() {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('preferences'))
    );
    return layout.free(header, renderBody);
  }
};
