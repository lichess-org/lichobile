import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import newGameForm from '../newGameForm';
import challengeForm from '../challengeForm';
import storage from '../../storage';
import { storageFenKey } from '../ai/aiCtrl';
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
          m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              newGameForm.openAIFromPosition(ctrl.fen());
            })
          }, i18n('playWithTheMachine')),
          m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              challengeForm.openFromPosition(ctrl.fen());
            })
          }, i18n('playWithAFriend')),
          m('button', {
            config: helper.ontouch(() => {
              ctrl.close();
              storage.set(storageFenKey, ctrl.fen());
              m.route('/ai');
            })
          }, i18n('Play with offline AI'))
        ];
      },
      ctrl.isOpen(),
      ctrl.close
    );
  }
};
