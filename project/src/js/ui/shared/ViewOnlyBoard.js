import chessground from 'chessground';
import settings from '../../settings';

export default {
  view(ctrl, args) {

    const boardClass = [
      'board',
      settings.general.theme.piece(),
      settings.general.theme.board(),
      args.variant ? args.variant.key : ''
    ].join(' ');

    function boardConf(el, isUpdate, context) {
      const config = makeConfig(args);
      if (context.ground) context.ground.set(config);
      else context.ground = chessground(el, config);
    }

    return (
      <div className={boardClass} config={boardConf} />
    );
  }
};

function makeConfig(args) {
  const { fen, lastMove, orientation } = args;
  return {
    viewOnly: true,
    minimalDom: true,
    coordinates: false,
    fen: fen,
    lastMove: lastMove ? lastMove.match(/.{2}/g) : null,
    orientation: orientation || 'white'
  };
}
