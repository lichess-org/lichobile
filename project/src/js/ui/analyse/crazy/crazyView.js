import settings from '../../../settings';
import crazyDrag from '../../round/crazy/crazyDrag';
import { drag as chessgroundDrag } from 'chessground-mobile';

const pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export default {
  pocket: function(ctrl, crazyData, color, position) {
    if (!crazyData) return null;
    const pocket = crazyData.pockets[color === 'white' ? 0 : 1];
    const className = [
      settings.general.theme.piece(),
      'pocket',
      position
    ].join(' ');

    const onstart = crazyDrag.bind(undefined, ctrl);
    const onmove = chessgroundDrag.move.bind(undefined, ctrl.chessground.data);
    const onend = chessgroundDrag.end.bind(undefined, ctrl.chessground.data);

    function pocketOnCreate(vnode) {
      const el = vnode.dom;
      const contentNode = document.getElementById('analyseInfos');
      el.addEventListener('touchstart', onstart);
      if (contentNode) {
        contentNode.addEventListener('touchmove', onmove);
        contentNode.addEventListener('touchend', onend);
      }
    }

    function pocketOnRemove(vnode) {
      const el = vnode.dom;
      const contentNode = document.getElementById('analyseInfos');
      el.removeEventListener('touchstart', onstart);
      if (contentNode) {
        contentNode.removeEventListener('touchmove', onmove);
        contentNode.removeEventListener('touchend', onend);
      }
    }

    return (
      <div className={className} oncreate={pocketOnCreate} onremove={pocketOnRemove}>
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
