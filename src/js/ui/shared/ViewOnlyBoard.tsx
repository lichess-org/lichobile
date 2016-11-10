import * as chessground from 'chessground-mobile';
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
  bounds?: Bounds
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
  bounds?: Bounds
}

export default {
  oninit({ attrs }: Mithril.Vnode<Attrs>) {
    const config = makeConfig(attrs);
    this.pieceTheme = settings.general.theme.piece();
    this.boardTheme = settings.general.theme.board();
    this.ground = new chessground.controller(config);
  },

  onbeforeupdate({ attrs }: Mithril.Vnode<Attrs>, { attrs: oldattrs }: Mithril.Vnode<Attrs>) {
    if (
      attrs.fen !== oldattrs.fen ||
      attrs.lastMove !== oldattrs.lastMove ||
      attrs.orientation !== oldattrs.orientation ||
      attrs.bounds.height !== oldattrs.bounds.height ||
      attrs.bounds.width !== oldattrs.bounds.width
    ) {
      this.ground.data.orientation = attrs.orientation || 'white';
      this.ground.data.lastMove = attrs.lastMove && uciToMove(attrs.lastMove);
      if (attrs.fen) this.ground.data.pieces = chessground.fen.read(attrs.fen);
      if (attrs.bounds) this.ground.bounds = attrs.bounds;
      return true;
    }
    else return false;
  },

  view({ attrs }: Mithril.Vnode<Attrs>) {

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

function makeConfig({ fen, lastMove, orientation, bounds }: Attrs) {
  const conf: Config = {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen,
    lastMove: lastMove && uciToMove(lastMove),
    orientation: orientation || 'white'
  };

  if (bounds) conf.bounds = bounds;

  return conf;
}
