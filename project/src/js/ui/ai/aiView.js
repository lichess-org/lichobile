import chessground from 'chessground';
import settings from '../../settings';
import layout from '../layout';
import { header } from '../shared/common';
import formWidgets from '../shared/form';
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplayTable,
  renderEndedGameStatus,
  renderGameActionsBarTablet
} from '../shared/offlineRound';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';

export default function view(ctrl) {

  function content() {

    const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
    const replayTable = renderReplayTable(ctrl.replay);

    if (helper.isPortrait())
      return [
        renderAntagonist(ctrl, ctrl.getOpponent().name, material[ctrl.data.opponent.color], 'opponent'),
        renderBoard(ctrl),
        renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player'),
        renderGameActionsBar(ctrl, actions.view)
      ];
    else if (helper.isLandscape() && helper.isVeryWideScreen())
      return [
        renderBoard(ctrl),
        <section key="table" className="table">
          <section className="playersTable offline">
            {renderAntagonist(ctrl, opponentSelector(), material[ctrl.data.opponent.color], 'opponent')}
            {replayTable}
            {renderEndedGameStatus(ctrl.actions)}
            {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player')}
          </section>
          {renderGameActionsBarTablet(ctrl)}
        </section>
      ];
    else
      return [
        renderBoard(ctrl),
        <section key="table" className="table">
          <section className="playersTable offline">
            {renderAntagonist(ctrl, ctrl.getOpponent().name, material[ctrl.data.opponent.color], 'opponent')}
            {replayTable}
            {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player')}
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
    header.bind(undefined, i18n('playOfflineComputer')),
    content,
    overlay
  );
}

function opponentSelector() {
  return (
    <div className="select_input">
      {formWidgets.renderSelect('opponent', 'opponent', settings.ai.availableOpponents, settings.ai.opponent)}
    </div>
  );
}
