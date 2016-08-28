import roundView from '../shared/round/view/roundView';
import gamesMenu from '../gamesMenu';
import layout from '../layout';
import { connectingHeader, viewOnlyBoardContent } from '../shared/common';

export default function view() {
  if (this.round) return roundView(this.round);

  const pov = gamesMenu.lastJoined;
  let board;

  if (pov) {
    board = () => viewOnlyBoardContent(pov.fen, pov.lastMove, pov.color,
      pov.variant.key);
    gamesMenu.lastJoined = null;
  } else {
    board = viewOnlyBoardContent;
  }

  return layout.board(connectingHeader, board);
}
