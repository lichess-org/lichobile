import gameApi from '../../lichess/game';
import chessground from 'chessground-mobile';
import layout from '../layout';
import { header as renderHeader, viewOnlyBoardContent } from '../shared/common';
import Board from '../shared/Board';
import { renderAntagonist, renderGameActionsBar, renderReplayTable } from '../shared/offlineRound';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { getBoardBounds } from '../../utils';
import actions from './actions';
import newGameMenu from './newOtbGame';
import settings from '../../settings';

export default function view(ctrl) {

  var content, header;
  const pieceTheme = settings.otb.useSymmetric() ? 'symmetric' : undefined;

  if (ctrl.data && ctrl.chessground) {
    header = () => renderHeader(gameApi.title(ctrl.data));
    content = () => renderContent(ctrl, pieceTheme);
  } else {
    header = () => renderHeader(i18n('playOnTheBoardOffline'));
    content = () => viewOnlyBoardContent(null, null, null, 'standard', null, pieceTheme);
  }

  function overlay() {
    return [
      actions.view(ctrl.actions),
      newGameMenu.view(ctrl.newGameMenu),
      renderPromotion(ctrl)
    ];
  }

  return layout.board(
    header,
    content,
    overlay,
    ctrl.data && ctrl.data.player.color || 'white'
  );
}

function renderContent(ctrl, pieceTheme) {
  const flip = settings.otb.flipPieces();
  const wrapperClasses = helper.classSet({
    'otb': true,
    'mode_flip': flip,
    'mode_facing': !flip,
    'turn_white': ctrl.chessground.data.turnColor === 'white',
    'turn_black': ctrl.chessground.data.turnColor === 'black'
  });
  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const playerName = i18n(ctrl.data.player.color);
  const opponentName = i18n(ctrl.data.opponent.color);
  const replayTable = renderReplayTable(ctrl.replay);
  const isPortrait = helper.isPortrait();
  const bounds = getBoardBounds(helper.viewportDim(), isPortrait, helper.isIpadLike(), helper.isLandscapeSmall(), 'game');
  const board = Board(
    ctrl.data,
    ctrl.chessground,
    bounds,
    isPortrait,
    wrapperClasses,
    pieceTheme
  );

  if (isPortrait)
    return [
      renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait, flip, pieceTheme),
      board,
      renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait, flip, pieceTheme),
      renderGameActionsBar(ctrl, 'otb')
    ];
  else
    return [
      board,
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait, flip, pieceTheme)}
          {replayTable}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait, flip, pieceTheme)}
        </section>
        {renderGameActionsBar(ctrl, 'otb')}
      </section>
    ];
}

