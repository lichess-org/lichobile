import * as chessground from 'chessground-mobile';
import settings from '../../settings';

interface Attrs {
  fen: string
  lastMove: string
  orientation: Color
  bounds: BoardBounds
  customPieceTheme: string
  variant: VariantKey
}

export default {
  oninit(rootVnode: Mithril.Vnode<Attrs>) {

    this.createBoard = ({ dom }: Mithril.Vnode<{}>) => {
      const config = makeConfig(rootVnode.attrs);
      if (!config.bounds) {
        config.bounds = dom.getBoundingClientRect();
      }
      this.ground = chessground(dom, config);
    };

    this.updateBoard = (attrs: Attrs) => {
      if (this.ground) {
        this.ground.set(makeConfig(attrs));
      }
    };
  },

  view({ attrs }: Mithril.Vnode<Attrs>) {

    const boardClass = [
      'display_board',
      attrs.customPieceTheme || settings.general.theme.piece(),
      settings.general.theme.board(),
      attrs.variant
    ].join(' ');

    return (
      <div
        className={boardClass}
        oncreate={this.createBoard}
        onupdate={() => this.updateBoard(attrs)}
      />
    );
  }
};

function makeConfig({ fen, lastMove, orientation, bounds }: Attrs) {
  const conf: any = {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen,
    lastMove: lastMove ? lastMove.match(/.{2}/g) : null,
    orientation: orientation || 'white'
  };

  if (bounds) conf.bounds = bounds;

  return conf;
}
