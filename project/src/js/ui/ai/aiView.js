import chessground from 'chessground-mobile';
import layout from '../layout';
import { header, viewOnlyBoardContent } from '../shared/common';
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplayTable,
  renderEndedGameStatus,
  renderGameActionsBarTablet
} from '../shared/offlineRound';
import { sideSelector, opponentSelector } from './actions';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import ground from '../round/ground';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';
import m from 'mithril';

export default function view(ctrl) {
  var content;

  if (ctrl.replay) {
    content = renderContent.bind(undefined, ctrl);
  } else {
    content = viewOnlyBoardContent;
  }

  return layout.board(
    header.bind(undefined, i18n('playOfflineComputer')),
    content,
    overlay.bind(undefined, ctrl)
  );
}

function renderContent(ctrl) {

  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const isPortrait = helper.isPortrait();
  const bounds = ground.getBounds(isPortrait);
  const replayTable = renderReplayTable(ctrl.replay);

  if (isPortrait)
    return [
      renderAntagonist(ctrl, m('h2', ctrl.getOpponent().name), material[ctrl.data.opponent.color], 'opponent', isPortrait),
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, bounds, isPortrait),
      renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait),
      renderGameActionsBar(ctrl, 'ai')
    ];
  else if (helper.isLandscape() && helper.isVeryWideScreen())
    return [
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, bounds, isPortrait),
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, [sideSelector(), opponentSelector()], material[ctrl.data.opponent.color], 'opponent', isPortrait)}
          {replayTable}
          {renderEndedGameStatus(ctrl.actions)}
          {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait)}
        </section>
        {renderGameActionsBarTablet(ctrl, 'ai')}
      </section>
    ];
  else
    return [
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, bounds, isPortrait),
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, m('h2', ctrl.getOpponent().name), material[ctrl.data.opponent.color], 'opponent', isPortrait)}
          {replayTable}
          {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait)}
        </section>
        {renderGameActionsBar(ctrl, 'ai')}
      </section>
    ];
}

function overlay(ctrl) {
  return [
    actions.view(ctrl.actions),
    renderPromotion(ctrl)
  ];
}

