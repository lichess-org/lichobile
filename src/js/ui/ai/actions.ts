import * as h from 'mithril/hyperscript';

import i18n from '../../i18n';
import * as gameApi from '../../lichess/game';
import settings from '../../settings';
import { PgnDumpResponse } from '../../chess';

import * as helper from '../helper';
import formWidgets from '../shared/form';
import { renderClaimDrawButton, renderEndedGameStatus } from '../shared/offlineRound/view';
import popupWidget from '../shared/popup';
import router from '../../router';
import { AiRoundInterface } from '../shared/round';

export interface AiActionsCtrl {
  open: () => void
  close: (fromBB?: string) => void
  isOpen: () => boolean
  sharePGN: () => void
  root: AiRoundInterface
}

export function opponentSelector() {
  const opts = settings.ai.availableOpponents.map(o =>
    ['aiNameLevelAiLevel', o[1], o[0], o[1]]
  );
  return h('div.select_input',
    formWidgets.renderSelect('opponent', 'opponent', opts, settings.ai.opponent)
  );
}

function renderAlways() {
  return [
    h('div.action.opponentSelector', [
      opponentSelector()
    ])
  ];
}

function resignButton(ctrl: AiRoundInterface) {
  return gameApi.playable(ctrl.data) ? h('div.resign', {
    key: 'resign'
  }, [
    h('button[data-icon=b]', {
      oncreate: helper.ontap(() => {
        ctrl.actions.close();
        ctrl.resign();
      })
    }, i18n('resign'))
  ]) : null;
}

export default {

  controller: function(root: AiRoundInterface) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen() {
        return isOpen;
      },
      sharePGN() {
        root.replay.pgn(root.white(), root.black())
        .then((data: PgnDumpResponse) =>
          window.plugins.socialsharing.share(data.pgn)
        );
      },
      root: root
    };
  },

  view(ctrl: AiActionsCtrl) {
    return popupWidget(
      'offline_actions',
      null,
      () => {
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
