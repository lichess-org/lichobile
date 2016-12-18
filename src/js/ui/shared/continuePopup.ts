import i18n from '../../i18n';
import router from '../../router';
import { validateFen, positionLooksLegit } from '../../utils/fen';
import popupWidget from '../shared/popup';
import * as helper from '../helper';
import playMachineForm from '../playMachineForm';
import challengeForm from '../challengeForm';
import { hasNetwork } from '../../utils';
import * as m from 'mithril';
import * as stream from 'mithril/stream';

interface Controller {
  open(fentoSet: string): void
  close(fromBB?: string): void
  fen: Mithril.Stream<string>
  isOpen(): boolean
}

export default {

  controller: function() {
    let isOpen = false;
    const fen = stream();

    function open(fentoSet: string) {
      router.backbutton.stack.push(close);
      fen(fentoSet);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
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

  view: function(ctrl: Controller) {
    return popupWidget(
      'continueFromHere',
      () => m('h2', i18n('continueFromHere')),
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
                router.set('/ai/fen/' + encodeURIComponent(ctrl.fen()));
              }
            })
          }, i18n('playOfflineComputer')),
          m('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              if (!validateFen(ctrl.fen()).valid || !positionLooksLegit(ctrl.fen())) {
                window.plugins.toast.show('Invalid FEN', 'short', 'center');
              } else {
                router.set('/otb/fen/' + encodeURIComponent(ctrl.fen()));
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
