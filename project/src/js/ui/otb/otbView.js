/** @jsx m */
import chessground from 'chessground';
import * as utils from '../../utils';
import layout from '../layout';
import { header } from '../widget/common';
import { renderAntagonist, renderGameActionsBar, renderReplayTable } from '../widget/offlineRound';
import { view as renderPromotion } from './promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';
import settings from '../../settings';
import m from 'mithril';

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
        renderBoard(ctrl, renderPromotion, wrapperClass),
        renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player'),
        renderGameActionsBar(ctrl, actions.view)
      ];
    else
      return [
        renderBoard(ctrl, renderPromotion, wrapperClass),
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

  return layout.board(
    utils.partialf(header, i18n('playOnTheBoardOffline')),
    content,
    actions.view.bind(undefined, ctrl.actions),
    ctrl.data.player.color
  );
}
