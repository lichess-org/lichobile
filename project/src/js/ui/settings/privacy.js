import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import session from '../../session';
import { swapKeyValue, Challenge, Message } from '../../lichess/prefs';
import m from 'mithril';

function renderBody(ctrl) {
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', formWidgets.renderCheckbox(i18n('letOtherPlayersFollowYou'),
        'follow', ctrl.follow)),
      m('li.list_item', [
        m('div.label', i18n('letOtherPlayersChallengeYou')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'challenge', swapKeyValue(Challenge.choices), ctrl.challenge))
      ]),
      m('li.list_item', [
        m('div.label', i18n('Let other players message you')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'message', swapKeyValue(Message.choices), ctrl.message))
      ])
    ])
  ];
}

module.exports = {
  controller: function() {
    const follow = session.lichessBackedProp('follow');
    const challenge = session.lichessBackedProp('challenge');
    const message = session.lichessBackedProp('message');

    return {
      follow,
      challenge,
      message
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('privacy'))
    );
    return layout.free(header, renderBody.bind(undefined, ctrl));
  }
};

