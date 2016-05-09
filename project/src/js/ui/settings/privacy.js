import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import session from '../../session';
import { swapKeyValue, Challenge } from '../../lichess/prefs';
import m from 'mithril';

function renderBody(ctrl) {
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', formWidgets.renderCheckbox(i18n('letOtherPlayersFollowYou'),
        'follow', ctrl.follow)),
      m('li.list_item', [
        m('div.label', i18n('letOtherPlayersChallengeYou')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'challenge', swapKeyValue(Challenge.choices), ctrl.challenge))
      ])
    ])
  ];
}

export default {
  controller: function() {
    const follow = session.lichessBackedProp('prefs.follow', session.savePreferences);
    const challenge = session.lichessBackedProp('prefs.challenge', session.savePreferences);

    return {
      follow,
      challenge
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('privacy'))
    );
    return layout.free(header, renderBody.bind(undefined, ctrl));
  }
};
