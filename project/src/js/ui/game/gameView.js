import roundView from '../round/view/roundView';
import gamesMenu from '../gamesMenu';
import layout from '../layout';
import { connectingHeader, viewOnlyBoardContent, header as headerWidget } from '../shared/common';

export default function view(ctrl) {
  if (ctrl.getRound()) return roundView(ctrl.getRound());

  const pov = gamesMenu.lastJoined;
  var header, board;

  if (pov) {
    header = connectingHeader;
    board = () => viewOnlyBoardContent(pov.fen, pov.lastMove, pov.color,
      pov.variant.key);
    gamesMenu.lastJoined = null;
  } else {
    header = () => headerWidget('lichess.org');
    board = viewOnlyBoardContent;
  }

  return layout.board(header, board);
}
