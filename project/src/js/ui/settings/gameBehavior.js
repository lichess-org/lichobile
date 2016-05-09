import * as utils from '../../utils';
import { header as headerWidget, backButton } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n from '../../i18n';
import session from '../../session';
import { swapKeyValue, SubmitMove, Takeback, AutoQueen, AutoThreefold } from '../../lichess/prefs';
import m from 'mithril';

function renderBody(ctrl) {
  return [
    m('ul.native_scroller.page.settings_list.game', [
      m('li.list_item', formWidgets.renderCheckbox(i18n('premovesPlayingDuringOpponentTurn'),
        'premove', ctrl.premove)),
      m('li.list_item', [
        m('div.label', i18n('takebacksWithOpponentApproval')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'takeback', swapKeyValue(Takeback.choices), ctrl.takeback))
      ]),
      m('li.list_item', [
        m('div.label', i18n('promoteToQueenAutomatically')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'autoQueen', swapKeyValue(AutoQueen.choices), ctrl.autoQueen))
      ]),
      m('li.list_item', [
        m('div.label', i18n('claimDrawOnThreefoldRepetitionAutomatically').replace(/\%s/g, '')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'autoThreefold', swapKeyValue(AutoThreefold.choices), ctrl.autoThreefold))
      ]),
      m('li.list_item', [
        m('div.label', i18n('moveConfirmation')),
        m('div.select_input.no_label.settingsChoicesBlock', formWidgets.renderSelect('', 'moveConfirmation', swapKeyValue(SubmitMove.choices), ctrl.submitMove))
      ])
    ])
  ];
}

export default {
  controller: function() {
    return {
      premove: session.lichessBackedProp('prefs.premove', session.savePreferences),
      takeback: session.lichessBackedProp('prefs.takeback', session.savePreferences),
      autoQueen: session.lichessBackedProp('prefs.autoQueen', session.savePreferences),
      autoThreefold: session.lichessBackedProp('prefs.autoThreefold', session.savePreferences),
      submitMove: session.lichessBackedProp('prefs.submitMove', session.savePreferences)
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('gameBehavior'))
    );
    return layout.free(header, renderBody.bind(undefined, ctrl));
  }
};
