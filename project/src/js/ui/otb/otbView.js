import chessground from 'chessground-mobile';
import * as utils from '../../utils';
import layout from '../layout';
import { header } from '../shared/common';
import { renderAntagonist, renderGameActionsBar, renderReplayTable } from '../shared/offlineRound';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';
import settings from '../../settings';

export default function view(ctrl) {

  function content() {
    const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
    const flip = settings.otb.flipPieces();
    const wrapperClass = helper.classSet({
      'otb': true,
      'mode_flip': flip,
      'mode_facing': !flip,
      'turn_white': ctrl.chessground.data.turnColor === 'white',
      'turn_black': ctrl.chessground.data.turnColor === 'black'
    });
    const playerName = i18n(ctrl.data.player.color);
    const opponentName = i18n(ctrl.data.opponent.color);
    const replayTable = renderReplayTable(ctrl.replay);

    if (helper.isPortrait())
      return [
        renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent'),
        renderBoard(ctrl, wrapperClass),
        renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player'),
        renderGameActionsBar(ctrl, actions.view)
      ];
    else
      return [
        renderBoard(ctrl, wrapperClass),
        <section key="table" className="table">
          <section className="playersTable offline">
            {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent')}
            {replayTable}
            {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player')}
          </section>
          {renderGameActionsBar(ctrl)}
        </section>
      ];
  }

  function overlay() {
    return [
      actions.view(ctrl.actions),
      renderPromotion(ctrl)
    ];
  }

  return layout.board(
    utils.partialf(header, i18n('playOnTheBoardOffline')),
    content,
    overlay,
    ctrl.data.player.color
  );
}
