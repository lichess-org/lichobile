import chessground from 'chessground';
import settings from '../../settings';
import m from 'mithril';

export default {
  controller() {
    return {
      fen: m.prop('')
    };
  },

  view(ctrl, args) {

    const fen = args.fen;

    if (ctrl.fen() === fen) {
      return { subtree: 'retain' };
    }

    ctrl.fen(fen);

    const boardClass = [
      'board',
      settings.general.theme.piece(),
      settings.general.theme.board(),
      args.variant ? args.variant.key : ''
    ].join(' ');

    return (
      <div className={boardClass}>
        {chessground.view(new chessground.controller(makeConfig(args)))}
      </div>
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
