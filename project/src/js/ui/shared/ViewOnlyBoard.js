import * as chessground from 'chessground-mobile';
import settings from '../../settings';

export default {
  oninit(rootVnode) {

    this.createBoard = ({ dom }) => {
      const config = makeConfig(rootVnode.attrs);
      if (!config.bounds) {
        config.bounds = dom.getBoundingClientRect();
      }
      this.ground = chessground(dom, config);
    };

    this.updateBoard = (attrs) => {
      if (this.ground) {
        this.ground.set(makeConfig(attrs));
      }
    };
  },

  view({ attrs }) {

    const boardClass = [
      'display_board',
      attrs.customPieceTheme || settings.general.theme.piece(),
      settings.general.theme.board(),
      attrs.variant ? attrs.variant.key : ''
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

function makeConfig({ fen, lastMove, orientation, bounds }) {
  const conf = {
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
