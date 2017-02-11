import * as helper from '../helper';
import { dropShadowHeader, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import session from '../../session';
import { swapKeyValue, ChallengeChoices } from '../../lichess/prefs';
import { SettingsProp } from '../../settings'
import * as h from 'mithril/hyperscript';

interface State {
  follow: SettingsProp<boolean>
  challenge: SettingsProp<string>
}

const PrivacyPrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit: function(vnode) {
    const follow = session.lichessBackedProp<boolean>('prefs.follow', session.savePreferences);
    const challenge = session.lichessBackedProp<string>('prefs.challenge', session.savePreferences);

    vnode.state = {
      follow,
      challenge
    }
  },

  view: function(vnode) {
    const ctrl = vnode.state;
    const header = () => dropShadowHeader(null, backButton(i18n('privacy')));
    return layout.free(header, renderBody.bind(undefined, ctrl));
  }
}

export default PrivacyPrefScreen

function renderBody(ctrl: State) {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderCheckbox(i18n('letOtherPlayersFollowYou'),
        'follow', ctrl.follow)),
      h('li.list_item', [
        h('div.label', i18n('letOtherPlayersChallengeYou')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'challenge', swapKeyValue(ChallengeChoices), ctrl.challenge))
      ])
    ])
  ];
}

