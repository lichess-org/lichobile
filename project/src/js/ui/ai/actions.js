import i18n from '../../i18n';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderSharePGNButton, renderEndedGameStatus } from '../shared/offlineRound';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';

const colors = [
  ['white', 'white'],
  ['black', 'black'],
  ['randomColor', 'random']
];

export function opponentSelector() {
  return (
    <div className="select_input">
      {formWidgets.renderSelect('opponent', 'opponent', settings.ai.availableOpponents, settings.ai.opponent)}
    </div>
  );
}

export function sideSelector() {
  return (
    <div className="select_input">
      {formWidgets.renderSelect('side', 'color', colors, settings.ai.color)}
    </div>
  );
}

function renderAlways(ctrl) {
  return [
    m('div.action', [
      sideSelector(),
      opponentSelector()
    ]),
    m('button[data-icon=U]', {
    config: helper.ontouch(ctrl.root.startNewGame)
    }, i18n('createAGame')),
    renderSharePGNButton(ctrl)
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
