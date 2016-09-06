import i18n from '../../i18n';
import router from '../../router';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import playMachineForm from '../playMachineForm';
import challengeForm from '../challengeForm';
import storage from '../../storage';
import { storageFenKey as aiStorageFenKey } from '../ai';
import { storageFenKey as otbStorageFenKey } from '../otb';
import { validateFen, positionLooksLegit } from '../editor/editor';
import { hasNetwork } from '../../utils';
import * as m from 'mithril';

export default {

  controller: function() {
    let isOpen = false;
    const fen = m.prop();

    function open(fentoSet) {
      backbutton.stack.push(close);
      fen(fentoSet);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open,
      close,
      fen,
      isOpen: function() {
        return isOpen;
      }
    };
  },

  view: function(ctrl) {
    return popupWidget(
      'continueFromHere',
      () => m('h2.withIcon[data-icon=U]', i18n('continueFromHere')),
      () => {
        return [
          hasNetwork() ? m('p.sep', i18n('playOnline')) : null,
          hasNetwork() ? m('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              playMachineForm.openAIFromPosition(ctrl.fen());
            })
          }, i18n('playWithTheMachine')) : null,
          hasNetwork() ? m('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              challengeForm.openFromPosition(ctrl.fen());
            })
          }, i18n('playWithAFriend')) : null,
          m('p.sep', i18n('playOffline')),
          m('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              if (!validateFen(ctrl.fen()).valid || !positionLooksLegit(ctrl.fen())) {
                window.plugins.toast.show('Invalid FEN', 'short', 'center');
              } else {
                storage.set(aiStorageFenKey, ctrl.fen());
                router.set('/ai');
              }
            })
          }, i18n('playOfflineComputer')),
          m('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              if (!validateFen(ctrl.fen()).valid || !positionLooksLegit(ctrl.fen())) {
                window.plugins.toast.show('Invalid FEN', 'short', 'center');
              } else {
                storage.set(otbStorageFenKey, ctrl.fen());
                router.set('/otb');
              }
            })
          }, i18n('playOnTheBoardOffline'))
        ];
      },
      ctrl.isOpen(),
      ctrl.close
    );
  }
};
