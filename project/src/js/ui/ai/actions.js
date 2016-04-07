import i18n from '../../i18n';
import gameApi from '../../lichess/game';
import helper from '../helper';
import settings from '../../settings';
import formWidgets from '../shared/form';
import { renderClaimDrawButton, renderEndedGameStatus } from '../shared/offlineRound';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import m from 'mithril';

export function opponentSelector() {
  const opps = settings.ai.availableOpponents.map(o =>
    ['aiNameLevelAiLevel', o[1], o[0], o[1]]
  );
  return (
    <div className="select_input">
      {formWidgets.renderSelect('opponent', 'opponent', opps, settings.ai.opponent)}
    </div>
  );
}

function renderAlways() {
  return [
    m('div.action.opponentSelector', [
      opponentSelector()
    ])
  ];
}

function resignButton(ctrl) {
  return gameApi.playable(ctrl.data) ? m('div.resign', {
    key: 'resign'
  }, [
    m('button[data-icon=b]', {
      config: helper.ontouch(() => {
        ctrl.actions.close();
        ctrl.resign();
      })
    }, i18n('resign'))
  ]) : null;
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
    return popupWidget(
      'offline_actions',
      () => <div><span className="fa fa-cogs" />{i18n('playOfflineComputer')}</div>,
      function() {
        return [
          renderEndedGameStatus(ctrl.root)
        ].concat(
          renderClaimDrawButton(ctrl.root),
          resignButton(ctrl.root),
          renderAlways()
        );
      },
      ctrl.isOpen(),
      ctrl.close
    );
  }
};
