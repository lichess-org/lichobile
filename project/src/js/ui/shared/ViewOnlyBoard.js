import chessground from 'chessground-mobile';
import settings from '../../settings';

export default {
  view(_, args) {

    const boardClass = [
      'display_board',
      args.customPieceTheme || settings.general.theme.piece(),
      settings.general.theme.board(),
      args.variant ? args.variant.key : ''
    ].join(' ');

    function boardConf(el, isUpdate, context) {
      const config = makeConfig(args);
      if (context.ground) {
        context.ground.set(config);
      } else {
        // TODO try to avoid that
        if (!config.bounds) {
          config.bounds = el.getBoundingClientRect();
        }
        context.ground = chessground(el, config);
      }
    }

    return (
      <div className={boardClass} config={boardConf} />
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
