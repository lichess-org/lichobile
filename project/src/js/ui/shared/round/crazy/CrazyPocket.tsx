import settings from '../../../../settings';
import crazyDrag from './crazyDrag';
import { drag as chessgroundDrag } from 'chessground-mobile';
import Round from '../Round';

const pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export interface Attrs {
  ctrl: Round;
  crazyData: {
    pockets: Pockets;
  }
  position: string;
  color: Color;
  customPieceTheme?: string;
}

export default {
  oninit(vnode: Mithril.Vnode<Attrs>) {
    const { ctrl } = vnode.attrs;
    const onstart = crazyDrag.bind(undefined, ctrl);
    const onmove = chessgroundDrag.move.bind(undefined, ctrl.chessground.data);
    const onend = chessgroundDrag.end.bind(undefined, ctrl.chessground.data);

    this.pocketOnCreate = function({ dom }) {
      const contentNode = document.getElementById('content_round');
      dom.addEventListener('touchstart', onstart);
      if (contentNode) {
        contentNode.addEventListener('touchmove', onmove);
        contentNode.addEventListener('touchend', onend);
      }
    };

    this.pocketOnRemove = function({ dom }) {
      const contentNode = document.getElementById('content_round');
      dom.removeEventListener('touchstart', onstart);
      if (contentNode) {
        contentNode.removeEventListener('touchmove', onmove);
        contentNode.removeEventListener('touchend', onend);
      }
    };
  },

  view(vnode: Mithril.Vnode<Attrs>) {
    const { crazyData, position, color, customPieceTheme } = vnode.attrs;

    if (!crazyData) return null;
    const pocket = crazyData.pockets[color === 'white' ? 0 : 1];
    const className = [
      customPieceTheme || settings.general.theme.piece(),
      'pocket',
      position
    ].join(' ');

    return (
      <div className={className} oncreate={this.pocketOnCreate} onremove={this.pocketOnRemove}>
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
