import i18n from '../../i18n';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderEndedGameStatus } from '../shared/offlineRound';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import m from 'mithril';

function renderAlways() {
  return [
    m('div.action', formWidgets.renderCheckbox(
      i18n('Flip pieces after move'), 'flipPieces', settings.otb.flipPieces
    )),
    m('div.action', formWidgets.renderCheckbox(
      i18n('Use Symmetric pieces'), 'useSymmetric', settings.otb.useSymmetric, m.redraw
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
    if (ctrl.isOpen()) {
      return popupWidget(
        'offline_actions',
        () => <div><span className="fa fa-beer" />{i18n('playOnTheBoardOffline')}</div>,
        function() {
          return [
            renderEndedGameStatus(ctrl.root)
          ].concat(
            renderAlways(ctrl)
          );
        },
        ctrl.isOpen(),
        ctrl.close
      );
    }

    return null;
  }
};
