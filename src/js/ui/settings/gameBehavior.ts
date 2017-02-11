import { dropShadowHeader, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import * as helper from '../helper';
import session from '../../session';
import { SettingsProp } from '../../settings'
import { swapKeyValue, SubmitMoveChoices, TakebackChoices, AutoQueenChoices, AutoThreefoldChoices } from '../../lichess/prefs';
import * as h from 'mithril/hyperscript';

interface State {
  premove: SettingsProp<boolean>
  takeback: SettingsProp<string>
  autoQueen: SettingsProp<string>
  autoThreefold: SettingsProp<string>
  submitMove: SettingsProp<string>
}

const GameBehaviorPrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit: function(vnode) {
    vnode.state = {
      premove: session.lichessBackedProp<boolean>('prefs.premove', session.savePreferences),
      takeback: session.lichessBackedProp<string>('prefs.takeback', session.savePreferences),
      autoQueen: session.lichessBackedProp<string>('prefs.autoQueen', session.savePreferences),
      autoThreefold: session.lichessBackedProp<string>('prefs.autoThreefold', session.savePreferences),
      submitMove: session.lichessBackedProp<string>('prefs.submitMove', session.savePreferences)
    }
  },

  view: function(vnode) {
    const ctrl = vnode.state;
    const header = () => dropShadowHeader(null, backButton(i18n('gameBehavior')))
    return layout.free(header, () => renderBody(ctrl))
  }
}

export default GameBehaviorPrefScreen

function renderBody(ctrl: State) {
  return [
    h('ul.native_scroller.page.settings_list.game', [
      h('li.list_item', formWidgets.renderCheckbox(i18n('premovesPlayingDuringOpponentTurn'),
        'premove', ctrl.premove)),
      h('li.list_item', [
        h('div.label', i18n('takebacksWithOpponentApproval')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'takeback', swapKeyValue(TakebackChoices), ctrl.takeback))
      ]),
      h('li.list_item', [
        h('div.label', i18n('promoteToQueenAutomatically')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'autoQueen', swapKeyValue(AutoQueenChoices), ctrl.autoQueen))
      ]),
      h('li.list_item', [
        h('div.label', i18n('claimDrawOnThreefoldRepetitionAutomatically').replace(/\%s/g, '')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'autoThreefold', swapKeyValue(AutoThreefoldChoices), ctrl.autoThreefold))
      ]),
      h('li.list_item', [
        h('div.label', i18n('moveConfirmation')),
        h('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'moveConfirmation', swapKeyValue(SubmitMoveChoices), ctrl.submitMove))
      ])
    ])
  ];
}

