import h from 'mithril/hyperscript'
import settings from '../../../../settings'
import * as chessgroundDrag from '../../../../chessground/drag'
import { Pockets } from '../../../../lichess/interfaces/game'

import { BoardInterface } from '../'
import crazyDrag from './crazyDrag'

const pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen']

export interface Attrs {
  ctrl: BoardInterface
  crazyData: {
    pockets: Pockets
  }
  color: Color
  position?: string
  customPieceTheme?: string
}

interface State {
  pocketOnCreate(vnode: Mithril.VnodeDOM<any, any>): void
  pocketOnRemove(vnode: Mithril.VnodeDOM<any, any>): void
}

const CrazyPocket: Mithril.Component<Attrs, State> = {
  oninit(vnode) {
    const { ctrl } = vnode.attrs
    const onstart = (e: TouchEvent) => crazyDrag(ctrl, e)
    const onmove = (e: TouchEvent) => chessgroundDrag.move(ctrl.chessground, e)
    const onend = (e: TouchEvent) => chessgroundDrag.end(ctrl.chessground, e)

    this.pocketOnCreate = function(vnode: Mithril.VnodeDOM<any, any>) {
      const dom = vnode.dom as HTMLElement
      dom.addEventListener('touchstart', onstart)
      dom.addEventListener('touchmove', onmove)
      dom.addEventListener('touchend', onend)
    }

    this.pocketOnRemove = function(vnode: Mithril.VnodeDOM<any, any>) {
      const dom = vnode.dom as HTMLElement
      dom.removeEventListener('touchstart', onstart)
      dom.removeEventListener('touchmove', onmove)
      dom.removeEventListener('touchend', onend)
    }
  },

  view(vnode) {
    const { crazyData, position, color, customPieceTheme } = vnode.attrs

    const pocket = crazyData.pockets[color === 'white' ? 0 : 1]
    const className = [
      customPieceTheme || settings.general.theme.piece(),
      'pocket',
      position || ''
    ].join(' ')

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
    )
  }
}

export default CrazyPocket
