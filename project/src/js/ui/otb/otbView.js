import chessground from 'chessground-mobile';
import * as utils from '../../utils';
import layout from '../layout';
import { header, viewOnlyBoardContent } from '../shared/common';
import { renderAntagonist, renderGameActionsBar, renderReplayTable } from '../shared/offlineRound';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import ground from '../round/ground';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';
import actions from './actions';
import newGameMenu from './newOtbGame';
import settings from '../../settings';

export default function view(ctrl) {

  var content;

  if (ctrl.replay) {
    content = renderContent.bind(undefined, ctrl);
  } else {
    content = viewOnlyBoardContent;
  }

  function overlay() {
    return [
      actions.view(ctrl.actions),
      newGameMenu.view(ctrl.newGameMenu),
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

function renderContent(ctrl) {
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
  const isPortrait = helper.isPortrait();
  const pieceTheme = settings.otb.useSymmetric() ? 'symmetric' : undefined;
  const bounds = ground.getBounds(isPortrait);

  if (isPortrait)
    return [
      renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait),
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, bounds, isPortrait, wrapperClass, pieceTheme),
      renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait),
      renderGameActionsBar(ctrl, 'otb')
    ];
  else
    return [
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, bounds, isPortrait, wrapperClass, pieceTheme),
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait)}
          {replayTable}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait)}
        </section>
        {renderGameActionsBar(ctrl, 'otb')}
      </section>
    ];
}

