import settings from '../../../settings';
import crazyDrag from './crazyDrag';
import { drag as chessgroundDrag } from 'chessground-mobile';
import gameApi from '../../../lichess/game';

const pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export default {
  pocket: function(ctrl, crazyData, color, position, isOTB, customPieceTheme) {
    if (!crazyData) return null;
    const pocket = crazyData.pockets[color === 'white' ? 0 : 1];
    const usablePos = position === (ctrl.vm.flip ? 'top' : 'bottom');
    const usable = usablePos && !ctrl.replaying() && gameApi.isPlayerPlaying(ctrl.data);
    const className = [
      customPieceTheme || settings.general.theme.piece(),
      'pocket',
      position,
      usable ? 'usable' : '',
      isOTB ? 'offline' : ''
    ].join(' ');

    function pocketConfig(el, isUpdate, ctx) {
      if (!isUpdate) {
        const onstart = crazyDrag.bind(undefined, ctrl);
        const onmove = chessgroundDrag.move.bind(undefined, ctrl.chessground.data);
        const onend = chessgroundDrag.end.bind(undefined, ctrl.chessground.data);
        const contentNode = document.getElementById('content_round');
        el.addEventListener('touchstart', onstart);
        if (contentNode) {
          contentNode.addEventListener('touchmove', onmove);
          contentNode.addEventListener('touchend', onend);
        }
        ctx.onunload = function() {
          el.removeEventListener('touchstart', onstart);
          if (contentNode) {
            contentNode.removeEventListener('touchmove', onmove);
            contentNode.removeEventListener('touchend', onend);
          }
        };
      }
      if (ctx.flip === ctrl.vm.flip || !usablePos) return;
      ctx.flip = ctrl.vm.flip;
    }

    return (
      <div className={className} config={pocketConfig}>
        {pieceRoles.map(role =>
          <piece
            data-role={role}
            data-color={color}
            data-nb={pocket[role] || 0}
            className={role + ' ' + color}
          />
        )}
      </div>
    );
  }
};
