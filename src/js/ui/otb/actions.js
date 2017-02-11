import i18n from '../../i18n';
import redraw from '../../utils/redraw';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderClaimDrawButton, renderEndedGameStatus } from '../shared/offlineRound/view';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as h from 'mithril/hyperscript';

function renderAlways(ctrl) {
  return [
    h('div.action', formWidgets.renderCheckbox(
      i18n('Flip pieces after move'), 'flipPieces', settings.otb.flipPieces
    )),
    h('div.action', formWidgets.renderCheckbox(
      i18n('Use Symmetric pieces'), 'useSymmetric', settings.otb.useSymmetric, redraw
    ))
  ];
}

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen;
      },
      sharePGN: function() {
        root.replay.pgn().then(data => window.plugins.socialsharing.share(data.pgn));
      },
      root: root
    };
  },

  view: function(ctrl) {
    if (ctrl.isOpen()) {
      return popupWidget(
        'offline_actions',
        null,
        function() {
          return [
            renderEndedGameStatus(ctrl.root)
          ].concat(
            renderClaimDrawButton(ctrl.root),
            renderAlways(ctrl.root)
          );
        },
        ctrl.isOpen(),
        ctrl.close
      );
    }

    return null;
  }
};
