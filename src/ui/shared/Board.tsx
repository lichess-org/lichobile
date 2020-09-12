import h from 'mithril/hyperscript'
import settings from '../../settings'
import redraw from '../../utils/redraw'
import Chessground from '../../chessground/Chessground'
import BoardBrush, { Shape } from './BoardBrush'

export interface Attrs {
  variant: VariantKey
  chessground: Chessground
  wrapperClasses?: string
  customPieceTheme?: string
  shapes?: ReadonlyArray<Shape>
  clearableShapes?: ReadonlyArray<Shape>
  canClearShapes?: boolean
}

interface State {
  wrapperOnCreate(vnode: Mithril.VnodeDOM<any, any>): void
  boardOnCreate(vnode: Mithril.VnodeDOM<any, any>): void
  boardOnRemove(): void
  boardTheme: string
  pieceTheme: string
  shapesCleared: boolean
  bounds?: ClientRect
  onResize: () => void
}

export default {
  oninit(vnode) {

    const { chessground, canClearShapes } = vnode.attrs

    this.wrapperOnCreate = ({ dom }) => {
      if (canClearShapes) {
        dom.addEventListener('touchstart', () => {
          if (!this.shapesCleared) {
            this.shapesCleared = true
            redraw()
          }
        })
      }
      this.bounds = dom.getBoundingClientRect()
      this.onResize = () => {
        this.bounds = dom.getBoundingClientRect()
      }
      window.addEventListener('resize', this.onResize)
    }

    this.boardOnCreate = ({ dom }: Mithril.VnodeDOM<any, any>) => {
      chessground.attach(dom as HTMLElement, this.bounds!)
    }

    this.boardOnRemove = () => {
      chessground.detach()
    }

    this.shapesCleared = false
    this.pieceTheme = settings.general.theme.piece()
    this.boardTheme = settings.general.theme.board()
  },

  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    // TODO: does not take into account same shapes put on 2 different nodes
    // maybe add fen attr to fix that
    if (attrs.clearableShapes !== oldattrs.clearableShapes) {
      this.shapesCleared = false
    }
    return true
  },

  view(vnode) {
    const { variant, chessground, wrapperClasses, customPieceTheme, shapes, clearableShapes } = vnode.attrs

    const boardClass = [
      'display_board',
      'orientation-' + chessground.state.orientation,
      this.boardTheme,
      customPieceTheme || this.pieceTheme,
      variant
    ].join(' ')

    let wrapperClass = 'playable_board_wrapper'

    if (wrapperClasses) {
      wrapperClass += ' '
      wrapperClass += wrapperClasses
    }

    const allShapes = [
      ...(shapes !== undefined ? shapes : []),
      ...(clearableShapes !== undefined && !this.shapesCleared ? clearableShapes : [])
    ]

    return h('section', {
      className: wrapperClass,
      oncreate: this.wrapperOnCreate,
      onremove: () => {
        window.removeEventListener('resize', this.onResize)
      }
    }, [
      vnode.children,
      h('div', {
        className: boardClass,
        oncreate: this.boardOnCreate,
        onremove: this.boardOnRemove,
      }),
      allShapes.length > 0 && this.bounds ?
        BoardBrush(
          this.bounds,
          chessground.state.orientation,
          allShapes,
          this.pieceTheme
        ) : null
    ])
  }
} as Mithril.Component<Attrs, State>
