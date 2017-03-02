import i18n from '../../i18n';
import redraw from '../../utils/redraw';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderClaimDrawButton, renderEndedGameStatus } from '../shared/offlineRound/view';
import ground from '../shared/offlineRound/ground';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as h from 'mithril/hyperscript';
import * as helper from '../helper';

function renderAlways(ctrl) {
  return [
    h('div.action', formWidgets.renderCheckbox(
      i18n('Flip pieces after move'), 'flipPieces', settings.otb.flipPieces,
        (v) => ground.changeOTBMode(ctrl.chessground, v)
    )),
    h('div.action', formWidgets.renderCheckbox(
      i18n('Use Symmetric pieces'), 'useSymmetric', settings.otb.useSymmetric, redraw
    )),
    h('button', {
      key: 'importGame',
      oncreate: helper.ontap(() => {
        ctrl.actions.importGame();
      })
    }, [h('span.fa.fa-cloud-upload'), i18n('importGame')])
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
      importGame: function() {
        root.replay.pgn().then(data => {
          const games = settings.otb.savedGames();
          games[1] = data;
          settings.otb.savedGames(games);
          router.set('/importer?game=1');
        });
      },
      root: root
    };
  },

  view: function(ctrl) {
    const actions = ctrl.actions;
    if (actions.isOpen()) {
      return popupWidget(
        'offline_actions',
        null,
        function() {
          return [
            renderEndedGameStatus(ctrl)
          ].concat(
            renderClaimDrawButton(ctrl),
            renderAlways(ctrl)
          );
        },
        actions.isOpen(),
        actions.close
      );
    }

    return null;
  }
};
