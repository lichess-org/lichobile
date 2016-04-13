import gameApi from '../../lichess/game';
import chessground from 'chessground-mobile';
import layout from '../layout';
import { header as renderHeader, viewOnlyBoardContent } from '../shared/common';
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplayTable,
  renderEndedGameStatus,
  renderGameActionsBarTablet
} from '../shared/offlineRound';
import { opponentSelector } from './actions';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import ground from '../round/ground';
import helper from '../helper';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';
import newGameMenu from './newAiGame';
import i18n from '../../i18n';
import m from 'mithril';

export default function view(ctrl) {
  var content, header;

  if (ctrl.replay) {
    header = renderHeader.bind(undefined, gameApi.title(ctrl.data));
    content = renderContent.bind(undefined, ctrl);
  } else {
    header = renderHeader.bind(undefined, i18n('playOfflineComputer'));
    content = viewOnlyBoardContent;
  }

  return layout.board(
    header,
    content,
    overlay.bind(undefined, ctrl)
  );
}

function renderContent(ctrl) {

  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const isPortrait = helper.isPortrait();
  const bounds = ground.getBounds(isPortrait);
  const replayTable = renderReplayTable(ctrl.replay);
  const isVWS = helper.isVeryWideScreen();

  if (isPortrait)
    return [
      renderAntagonist(ctrl, m('h2', ctrl.getOpponent().name), material[ctrl.data.opponent.color], 'opponent', isPortrait),
      renderBoard(ctrl.data, ctrl.chessground, bounds, isPortrait),
      renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait),
      renderGameActionsBar(ctrl, 'ai')
    ];
  else if (isVWS)
    return [
      renderBoard(ctrl.data, ctrl.chessground, bounds, isPortrait),
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, [opponentSelector()], material[ctrl.data.opponent.color], 'opponent', isPortrait, isVWS)}
          <div key="spinner" className="engineSpinner">
          { ctrl.vm.engineSearching ?
            <div className="fa fa-spinner fa-pulse" /> : null
          }
          </div>
          {replayTable}
          {renderEndedGameStatus(ctrl.actions)}
          {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait)}
        </section>
        {renderGameActionsBarTablet(ctrl, 'ai')}
      </section>
    ];
  else
    return [
      renderBoard(ctrl.data, ctrl.chessground, bounds, isPortrait),
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
    newGameMenu.view(ctrl.newGameMenu),
    renderPromotion(ctrl)
  ];
}

