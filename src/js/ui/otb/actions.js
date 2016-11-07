import i18n from '../../i18n';
import redraw from '../../utils/redraw';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderClaimDrawButton, renderEndedGameStatus } from '../shared/offlineRound/view';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import * as m from 'mithril';

function renderAlways() {
  return [
    m('div.action', formWidgets.renderCheckbox(
      i18n('Flip pieces after move'), 'flipPieces', settings.otb.flipPieces
    )),
    m('div.action', formWidgets.renderCheckbox(
      i18n('Use Symmetric pieces'), 'useSymmetric', settings.otb.useSymmetric, redraw
    )),
    m('div.action', formWidgets.renderCheckbox(
      i18n('See Symmetric coordinates'), 'seeSymmetricCoordinates', settings.otb.seeSymmetricCoordinates, redraw
    ))
  ];
}

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
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
            renderAlways()
          );
        },
        ctrl.isOpen(),
        ctrl.close
      );
    }

    return null;
  }
};
