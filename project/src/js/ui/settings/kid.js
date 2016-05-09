import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import session from '../../session';
import m from 'mithril';

function renderBody(ctrl) {
  return [
    m('div.native_scroller.page.settings_list.game', [
      m('p.explanation', 'This is about safety. In kid mode, all site communications are disabled.  Enable this for your children and school students, to protect them from other Internet users.'),
      m('p.list_item', [
        'In kid mode, the logo above username in the menu is the ', m('span.kiddo', '😊'), ' icon.',
        m('br'),
        'So you know that it\'s enabled and your kids are safe.'
      ]),
      m('p.list_item', formWidgets.renderCheckbox('Enable kid mode', 'kidMode', ctrl.kidMode))
    ])
  ];
}

export default {
  controller: function() {
    const kidMode = session.lichessBackedProp('kid', session.toggleKidMode);

    return {
      kidMode
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(headerWidget, null,
      backButton('Kid mode')
    );
    return layout.free(header, renderBody.bind(undefined, ctrl));
  }
};
