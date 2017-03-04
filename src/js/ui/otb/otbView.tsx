import * as h from 'mithril/hyperscript'
import chessground from '../../chessground';
import i18n from '../../i18n';
import Board from '../shared/Board';
import { renderAntagonist, renderGameActionsBar, renderReplayTable } from '../shared/offlineRound/view';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import * as helper from '../helper';
import actions from './actions';
import newGameMenu from './newOtbGame';
import settings from '../../settings';
import OtbRound from './OtbRound';

export function overlay(ctrl: OtbRound) {
  return [
    actions.view(ctrl),
    newGameMenu.view(ctrl.newGameMenu),
    renderPromotion(ctrl)
  ];
}

export function renderContent(ctrl: OtbRound, pieceTheme: string) {
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
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'game');

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessgroundCtrl: ctrl.chessground,
    bounds,
    isPortrait,
    wrapperClasses,
    customPieceTheme: pieceTheme
  });

  const orientationKey = isPortrait ? 'o-portrait' : 'o-landscape';

  if (isPortrait)
    return h.fragment({ key: orientationKey }, [
      renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait, flip, pieceTheme),
      board,
      renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait, flip, pieceTheme),
      renderGameActionsBar(ctrl, 'otb')
    ]);
  else
    return h.fragment({ key: orientationKey }, [
      board,
      <section key="table" className="table">
        <section className="playersTable offline">
          {renderAntagonist(ctrl, opponentName, material[ctrl.data.opponent.color], 'opponent', isPortrait, flip, pieceTheme)}
          {replayTable}
          {renderAntagonist(ctrl, playerName, material[ctrl.data.player.color], 'player', isPortrait, flip, pieceTheme)}
        </section>
        {renderGameActionsBar(ctrl, 'otb')}
      </section>
    ]);
}
