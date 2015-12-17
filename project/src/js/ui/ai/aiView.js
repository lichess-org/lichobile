import chessground from 'chessground-mobile';
import layout from '../layout';
import { header } from '../shared/common';
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplayTable,
  renderEndedGameStatus,
  renderGameActionsBarTablet
} from '../shared/offlineRound';
import { sideSelector, opponentSelector } from './actions';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';
import m from 'mithril';

export default function view(ctrl) {

  return layout.board(
    header.bind(undefined, i18n('playOfflineComputer')),
    content.bind(undefined, ctrl),
    overlay.bind(undefined, ctrl)
  );
}

function content(ctrl) {

  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const replayTable = renderReplayTable(ctrl.replay);

  if (helper.isPortrait())
    return [
      renderAntagonist(ctrl, m('h2', ctrl.getOpponent().name), material[ctrl.data.opponent.color], 'opponent'),
      renderBoard(ctrl),
      renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player'),
      renderGameActionsBar(ctrl, actions.view)
    ];
  else if (helper.isLandscape() && helper.isVeryWideScreen())
    return [
      renderBoard(ctrl),
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, [sideSelector(), opponentSelector()], material[ctrl.data.opponent.color], 'opponent')}
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
          {renderAntagonist(ctrl, m('h2', ctrl.getOpponent().name), material[ctrl.data.opponent.color], 'opponent')}
          {replayTable}
          {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player')}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ];
}

function overlay(ctrl) {
  return [
    actions.view(ctrl.actions),
    renderPromotion(ctrl)
  ];
}

