import * as chessground from 'chessground-mobile';
import { uciToMove } from '../../utils/chessFormat';
import settings from '../../settings';

interface Attrs {
  fen: string
  lastMove: string
  orientation: Color
  bounds: BoardBounds
  customPieceTheme: string
  variant: VariantKey
}

interface Config {
  viewOnly: boolean
  minimalDom: boolean
  coordinates: boolean
  fen: string
  lastMove: MoveTuple
  orientation: Color
  bounds?: ClientRect
}

export default {
  oninit({ attrs }: Mithril.Vnode<Attrs>) {
    const config = makeConfig(attrs);
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
      this.ground.data.pieces = chessground.fen.read(attrs.fen);
      this.ground.data.orientation = attrs.orientation || 'white';
      if (attrs.lastMove) this.ground.data.lastMove = uciToMove(attrs.lastMove);
      if (attrs.bounds) this.ground.bounds = attrs.bounds;
      return true;
    }
    else return false;
  },

  view({ attrs }: Mithril.Vnode<Attrs>) {

    const boardClass = [
      'display_board',
      attrs.customPieceTheme || settings.general.theme.piece(),
      settings.general.theme.board(),
      attrs.variant
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
