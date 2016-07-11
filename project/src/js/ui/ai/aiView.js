import gameApi from '../../lichess/game';
import chessground from 'chessground-mobile';
import layout from '../layout';
import { header as renderHeader, viewOnlyBoardContent } from '../shared/common';
import Board from '../shared/Board';
import {
  renderAntagonist,
  renderGameActionsBar,
  renderReplayTable
} from '../shared/offlineRound';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import { getBoardBounds } from '../../utils';
import actions from './actions';
import newGameMenu from './newAiGame';
import i18n from '../../i18n';

export default function view(ctrl) {
  var content, header;

  if (ctrl.data && ctrl.chessground) {
    header = () => renderHeader(gameApi.title(ctrl.data));
    content = () => renderContent(ctrl);
  } else {
    header = () => renderHeader(i18n('playOfflineComputer'));
    content = viewOnlyBoardContent;
  }

  return layout.board(
    header,
    content,
    () => overlay(ctrl)
  );
}

function renderContent(ctrl) {

  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const isPortrait = helper.isPortrait();
  const bounds = getBoardBounds(helper.viewportDim(), isPortrait, helper.isIpadLike(), helper.isLandscapeSmall(), 'game');
  const replayTable = renderReplayTable(ctrl.replay);

  const aiName = (
    <h2>
      {ctrl.getOpponent().name}
      { ctrl.vm.engineSearching ?
        <span className="engineSpinner fa fa-hourglass-half" /> :
        null
      }
    </h2>
  );

  const board = Board(
    ctrl.data,
    ctrl.chessground,
    bounds,
    isPortrait
  );

  if (isPortrait) {
    return [
      renderAntagonist(ctrl, aiName, material[ctrl.data.opponent.color], 'opponent', isPortrait),
      board,
      renderAntagonist(ctrl, ctrl.playerName(), material[ctrl.data.player.color], 'player', isPortrait),
      renderGameActionsBar(ctrl, 'ai')
    ];
  } else {
    return [
      board,
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, aiName, material[ctrl.data.opponent.color], 'opponent', isPortrait)}
          {replayTable}
          {renderAntagonist(ctrl, '', material[ctrl.data.player.color], 'player', isPortrait)}
        </section>
        {renderGameActionsBar(ctrl, 'ai')}
      </section>
    ];
  }
}

function overlay(ctrl) {
  return [
    actions.view(ctrl.actions),
    newGameMenu.view(ctrl.newGameMenu),
    renderPromotion(ctrl)
  ];
}

