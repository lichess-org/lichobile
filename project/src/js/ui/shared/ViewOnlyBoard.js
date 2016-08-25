import chessground from 'chessground-mobile';
import settings from '../../settings';

export default {
  view(rootVnode) {

    const args = rootVnode.attrs;

    const boardClass = [
      'display_board',
      args.customPieceTheme || settings.general.theme.piece(),
      settings.general.theme.board(),
      args.variant ? args.variant.key : ''
    ].join(' ');

    function boardConf(vnode) {
      const el = vnode.dom;
      const config = makeConfig(args);
      if (!config.bounds) {
        config.bounds = el.getBoundingClientRect();
      }
      vnode.state.ground = chessground(el, config);

    }

    function boardOnUpdate(vnode) {
      if (vnode.state.ground) {
        const config = makeConfig(args);
        vnode.state.ground.set(config);
      }
    }

    return (
      <div className={boardClass} oncreate={boardConf} onupdate={boardOnUpdate} />
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
