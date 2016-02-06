import roundView from '../round/view/roundView';
import gamesMenu from '../gamesMenu';
import layout from '../layout';
import * as utils from '../../utils';
import { connectingHeader, viewOnlyBoardContent, header as headerWidget } from '../shared/common';

export default function view(ctrl) {
  if (ctrl.getRound()) return roundView(ctrl.getRound());

  var pov = gamesMenu.lastJoined;
  var header, board;

  if (pov) {
    header = connectingHeader;
    board = utils.partialf(viewOnlyBoardContent, pov.fen, pov.lastMove, pov.color,
      pov.variant.key);
    gamesMenu.lastJoined = null;
  } else {
    header = utils.partialf(headerWidget, 'lichess.org');
    board = viewOnlyBoardContent;
  }

  return layout.board(header, board);
}
