import * as utils from '../../utils';
import helper from '../helper';
import i18n from '../../i18n';
import { util } from 'chessground';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderSharePGNButton, renderEndedGameStatus } from '../shared/offlineRound';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import m from 'mithril';

function renderAlways(ctrl) {
  var d = ctrl.root.data;
  return [
    m('button[data-icon=U]', {
      config: helper.ontouch(utils.f(ctrl.root.initAs, util.opposite(d.player.color)))
    }, i18n('createAGame')),
    renderSharePGNButton(ctrl),
    m('div.action', formWidgets.renderCheckbox(
      i18n('Flip pieces after move'), 'flipPieces', settings.otb.flipPieces
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
        window.plugins.socialsharing.share(root.replay.pgn());
      },
      root: root
    };
  },

  view: function(ctrl) {
    if (ctrl.isOpen())
      return popupWidget(
        'offline_actions',
        null,
        function() {
          return [
            renderEndedGameStatus(ctrl)
          ].concat(
            renderAlways(ctrl)
          );
        },
        ctrl.isOpen(),
        ctrl.close
      );
  }
};
