import chessground from '../../chessground';
import { uciToMove } from '../../utils/chessFormat';
import settings from '../../settings';

interface Bounds {
  width: number
  height: number
}

export interface Attrs {
  fen?: string
  lastMove?: string
  orientation?: Color
  bounds: Bounds
  customPieceTheme?: string
  variant?: VariantKey
}

interface Config {
  viewOnly: boolean
  minimalDom: boolean
  coordinates: boolean
  fen: string
  lastMove: MoveTuple
  orientation: Color
  bounds: Bounds
}

interface State {
  ground: Chessground.Controller
  pieceTheme: string
  boardTheme: string
}

const ViewOnlyBoard: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    const config = makeConfig(attrs);
    this.pieceTheme = settings.general.theme.piece();
    this.boardTheme = settings.general.theme.board();
    this.ground = new chessground.controller(config);
  },

  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    if (
      attrs.fen !== oldattrs.fen ||
      attrs.lastMove !== oldattrs.lastMove ||
      attrs.orientation !== oldattrs.orientation || (attrs.bounds && (
      attrs.bounds.height !== oldattrs.bounds.height ||
      attrs.bounds.width !== oldattrs.bounds.width))
    ) {
      this.ground.data.orientation = attrs.orientation || 'white';
      this.ground.data.lastMove = attrs.lastMove && uciToMove(attrs.lastMove);
      if (attrs.fen) this.ground.data.pieces = chessground.fen.read(attrs.fen);
      if (attrs.bounds) this.ground.data.bounds = attrs.bounds;
      return true;
    }
    else return false;
  },

  view({ attrs }) {

    const boardClass = [
      'display_board',
      attrs.customPieceTheme || this.pieceTheme,
      this.boardTheme,
      attrs.variant || 'standard'
    ].join(' ');

    return (
      <div className={boardClass}>
        {chessground.view(this.ground)}
      </div>
    );
  }
};

export default ViewOnlyBoard

function makeConfig({ fen, lastMove, orientation, bounds }: Attrs) {
  const conf: Config = {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen,
    lastMove: lastMove && uciToMove(lastMove),
    orientation: orientation || 'white',
    bounds
  };

  return conf;
}
