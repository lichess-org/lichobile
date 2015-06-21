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
    if (helper.isPortrait())
      return (
        <div className="content round">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent')}
          {renderBoard(ctrl, renderPromotion, wrapperClass)}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player')}
          {renderGameActionsBar(ctrl, actions.view)}
        </div>
      );
    else
      return (
        <div className="content round">
          {renderBoard(ctrl, renderPromotion, wrapperClass)}
          <section key="table" className="table">
            {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent')}
            {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player')}
            {renderGameActionsBar(ctrl, actions.view)}
          </section>
        </div>
      );
  }

  return layout.board(
    utils.partialf(widgets.header, i18n('playOnTheBoardOffline')),
    content,
    null,
    ctrl.data.player.color
  );
}
