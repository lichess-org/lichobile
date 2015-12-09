import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import newGameForm from '../newGameForm';
import challengeForm from '../challengeForm';
import storage from '../../storage';
import { storageFenKey as aiStorageFenKey } from '../ai/aiCtrl';
import { storageFenKey as otbStorageFenKey } from '../otb/otbCtrl';
import { validateFen, positionLooksLegit } from './editor';
import { hasNetwork } from '../../utils';
import m from 'mithril';

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
      m('h2.withIcon[data-icon=U]', i18n('continueFromHere')),
      () => {
        return [
          hasNetwork() ? m('p.sep', i18n('playOnline')) : null,
          hasNetwork() ? m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              newGameForm.openAIFromPosition(ctrl.fen());
            })
          }, i18n('playWithTheMachine')) : null,
          hasNetwork() ? m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              challengeForm.openFromPosition(ctrl.fen());
            })
          }, i18n('playWithAFriend')) : null,
          m('p.sep', i18n('playOffline')),
          m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              if (!validateFen(ctrl.fen()).valid || !positionLooksLegit(ctrl.fen())) {
                window.plugins.toast.show('Invalid FEN', 'short', 'center');
              } else {
                storage.set(aiStorageFenKey, ctrl.fen());
                m.route('/ai');
              }
            })
          }, i18n('playOfflineComputer')),
          m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              if (!validateFen(ctrl.fen()).valid || !positionLooksLegit(ctrl.fen())) {
                window.plugins.toast.show('Invalid FEN', 'short', 'center');
              } else {
                storage.set(otbStorageFenKey, ctrl.fen());
                m.route('/otb');
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
