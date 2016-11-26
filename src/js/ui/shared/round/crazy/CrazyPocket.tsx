import settings from '../../../../settings';
import crazyDrag from './crazyDrag';
import { drag as chessgroundDrag } from 'chessground-mobile';
import { BoardInterface } from '../'

const pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export interface Attrs {
  ctrl: BoardInterface
  crazyData: {
    pockets: Pockets
  }
  position: string
  color: Color
  customPieceTheme?: string
  bestDropRole?: {
    role: Role
    brush: string
  }
}

interface State {
  pocketOnCreate(vnode: Mithril.ChildNode): void
  pocketOnRemove(vnode: Mithril.ChildNode): void
}

export default {
  oninit(vnode: Mithril.Vnode<Attrs, State>) {
    const { ctrl } = vnode.attrs;
    const onstart = crazyDrag.bind(undefined, ctrl);
    const onmove = chessgroundDrag.move.bind(undefined, ctrl.chessground.data);
    const onend = chessgroundDrag.end.bind(undefined, ctrl.chessground.data);

    this.pocketOnCreate = function({ dom }: Mithril.ChildNode) {
      dom.addEventListener('touchstart', onstart);
      dom.addEventListener('touchmove', onmove);
      dom.addEventListener('touchend', onend);
    };

    this.pocketOnRemove = function({ dom }: Mithril.ChildNode) {
      dom.removeEventListener('touchstart', onstart);
      dom.removeEventListener('touchmove', onmove);
      dom.removeEventListener('touchend', onend);
    };
  },

  view(vnode: Mithril.Vnode<Attrs, State>) {
    const { crazyData, position, color, customPieceTheme, bestDropRole } = vnode.attrs;

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
            className={role + ' ' + color + (bestDropRole && bestDropRole.role === role ? ' bestDrop ' + bestDropRole.brush : '')}
          />
        )}
      </div>
    );
  }
};
