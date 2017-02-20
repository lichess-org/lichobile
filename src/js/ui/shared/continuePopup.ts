import i18n from '../../i18n';
import router from '../../router';
import { validateFen, positionLooksLegit } from '../../utils/fen';
import popupWidget from '../shared/popup';
import * as helper from '../helper';
import playMachineForm from '../playMachineForm';
import challengeForm from '../challengeForm';
import { hasNetwork } from '../../utils';
import * as h from 'mithril/hyperscript';
import * as stream from 'mithril/stream';

export interface Controller {
  open(fentoSet: string): void
  close(fromBB?: string): void
  fen: Mithril.Stream<string | undefined>
  isOpen(): boolean
}

export default {

  controller() {
    let isOpen = false;
    const fen = stream(undefined);

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

  view(ctrl: Controller) {
    return popupWidget(
      'continueFromHere',
      () => h('h2', i18n('continueFromHere')),
      () => {
        return [
          hasNetwork() ? h('p.sep', i18n('playOnline')) : null,
          hasNetwork() ? h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              playMachineForm.openAIFromPosition(ctrl.fen());
            })
          }, i18n('playWithTheMachine')) : null,
          hasNetwork() ? h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              challengeForm.openFromPosition(ctrl.fen());
            })
          }, i18n('playWithAFriend')) : null,
          h('p.sep', i18n('playOffline')),
          h('button', {
            oncreate: helper.ontap(() => {
              ctrl.close();
              if (!validateFen(ctrl.fen()).valid || !positionLooksLegit(ctrl.fen())) {
                window.plugins.toast.show('Invalid FEN', 'short', 'center');
              } else {
                router.set('/ai/fen/' + encodeURIComponent(ctrl.fen()));
              }
            })
          }, i18n('playOfflineComputer')),
          h('button', {
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
