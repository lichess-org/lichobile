/** @jsx m */
import chessground from 'chessground';
import utils from '../../utils';
import layout from '../layout';
import widgets from '../widget/common';
import { renderAntagonist, renderGameActionsBar } from '../widget/offlineRound';
import { view as renderPromotion } from './promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';

export default function view(ctrl) {


  function content() {

    const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
    const opponentName = ctrl.getOpponent().name;
    const playerName = '';

    if (helper.isPortrait())
      return (
        <div className="content round">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent')}
          {renderBoard(ctrl, renderPromotion)}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player')}
          {renderGameActionsBar(ctrl, actions.view)}
        </div>
      );
    else
      return (
        <div className="content round">
          {renderBoard(ctrl, renderPromotion)}
          <section key="table" className="table">
            {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent')}
            {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player')}
            {renderGameActionsBar(ctrl, actions.view)}
          </section>
        </div>
      );
  }

  return layout.board(utils.partialf(widgets.header, i18n('playOfflineComputer')), content, null);
}
