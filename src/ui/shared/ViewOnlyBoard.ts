import * as h from 'mithril/hyperscript'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'
import Chessground from '../../chessground/Chessground'
import { uciToMove } from '../../utils/chessFormat'
import settings from '../../settings'

interface Bounds {
  width: number
  height: number
}

export interface Attrs {
  fen: string
  orientation: Color
  lastMove?: string
  bounds?: Bounds
  customPieceTheme?: string
  variant?: VariantKey
}

interface Config {
  batchRAF: (c: () => void) => void
  fen: string
  orientation: Color
  viewOnly: boolean
  minimalDom: boolean
  coordinates: boolean
  lastMove: KeyPair | null
  initBounds?: ClientRect
}

interface State {
  ground: Chessground
  pieceTheme: string
  boardTheme: string
}

const ViewOnlyBoard: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    this.pieceTheme = settings.general.theme.piece()
    this.boardTheme = settings.general.theme.board()
    this.ground = new Chessground(makeConfig(attrs))
  },

  oncreate({ dom }) {
    this.ground.attach(dom as HTMLElement)
  },

  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    if (
      attrs.fen !== oldattrs.fen ||
      attrs.lastMove !== oldattrs.lastMove ||
      attrs.orientation !== oldattrs.orientation || (!oldattrs.bounds || attrs.bounds && (
      attrs.bounds.height !== oldattrs.bounds.height ||
      attrs.bounds.width !== oldattrs.bounds.width))
    ) {
      return true
    }
    else return false
  },

  onupdate({ attrs }) {
    const conf = {
      ...attrs,
      lastMove: attrs.lastMove ? uciToMove(attrs.lastMove) : undefined
    }
    // view only board care only about width and height
    if (attrs.bounds) this.ground.setBounds(attrs.bounds as ClientRect)
    this.ground.set(conf)
  },

  onremove() {
    this.ground.detach()
  },

  view({ attrs }) {

    const boardClass = [
      'display_board',
      attrs.customPieceTheme || this.pieceTheme,
      this.boardTheme,
      attrs.variant || 'standard'
    ].join(' ')

    return h('div', { className: boardClass })
  }
}

export default ViewOnlyBoard

function makeConfig({ fen, lastMove, orientation, bounds }: Attrs) {
  // view only boards needs only width and height
  let initBounds
  if (bounds) {
    initBounds = {
      height: bounds.height,
      width: bounds.width,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  }
  const conf: Config = {
    batchRAF: batchRequestAnimationFrame,
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen,
    lastMove: lastMove ? uciToMove(lastMove) : null,
    orientation: orientation || 'white',
    initBounds
  }

  return conf
}
