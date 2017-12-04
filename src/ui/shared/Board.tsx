import settings from '../../settings'
import Chessground from '../../chessground/Chessground'
import BoardBrush, { Shape } from './BoardBrush'

export interface Bounds {
  width: number
  height: number
}

export interface Attrs {
  variant: VariantKey
  chessground: Chessground
  bounds: Bounds
  wrapperClasses?: string
  customPieceTheme?: string
  shapes?: Shape[]
  alert?: Mithril.Children
}

interface State {
  boardOnCreate(vnode: Mithril.DOMNode): void
  boardOnRemove(): void
  boardTheme: string
  pieceTheme: string
}

const Board: Mithril.Component<Attrs, State> = {
  oninit(vnode) {

    const { chessground } = vnode.attrs

    this.boardOnCreate = ({ dom }: Mithril.DOMNode) => {
      chessground.attach(dom as HTMLElement)
    }

    this.boardOnRemove = () => {
      chessground.detach()
    }

    this.pieceTheme = settings.general.theme.piece()
    this.boardTheme = settings.general.theme.board()
  },

  view(vnode) {
    const { variant, chessground, bounds, wrapperClasses, customPieceTheme, shapes, alert } = vnode.attrs

    const boardClass = [
      'display_board',
      'orientation-' + chessground.state.orientation,
      this.boardTheme,
      customPieceTheme || this.pieceTheme,
      variant
    ].join(' ')

    let wrapperClass = 'game_board_wrapper'

    if (wrapperClasses) {
      wrapperClass += ' '
      wrapperClass += wrapperClasses
    }

    const wrapperStyle = bounds ? {
      height: bounds.height + 'px',
      width: bounds.width + 'px'
    } : {}

    return (
      <section className={wrapperClass} style={wrapperStyle}>
        <div className={boardClass}
          oncreate={this.boardOnCreate}
          onremove={this.boardOnRemove}
        />
        { alert ? <div className="board_alert">{alert}</div> : null }
        {
          !!shapes ?
            BoardBrush(
              bounds,
              chessground.state.orientation,
              shapes,
              this.pieceTheme
            ) : null
        }
      </section>
    )
  }
}

export default Board
