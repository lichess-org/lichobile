import * as chessground from 'chessground-mobile';
import settings from '../../settings';

export default {
  oninit(rootVnode) {

    function boardOnInit(vnode) {
      const el = vnode.dom;
      const config = makeConfig(rootVnode.attrs);
      if (!config.bounds) {
        config.bounds = el.getBoundingClientRect();
      }
      vnode.state.ground = chessground(el, config);

    }

    function boardOnUpdate(vnode) {
      if (vnode.state.ground) {
        const config = makeConfig(rootVnode.attrs);
        vnode.state.ground.set(config);
      }
    }

    rootVnode.state = {
      boardOnInit,
      boardOnUpdate
    };
  },

  view(rootVnode) {

    const args = rootVnode.attrs;

    const boardClass = [
      'display_board',
      args.customPieceTheme || settings.general.theme.piece(),
      settings.general.theme.board(),
      args.variant ? args.variant.key : ''
    ].join(' ');

    return (
      <div className={boardClass} oncreate={this.boardOnInit} onupdate={this.boardOnUpdate} />
    );
  }
};

function makeConfig(args) {
  const { fen, lastMove, orientation, bounds } = args;
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
