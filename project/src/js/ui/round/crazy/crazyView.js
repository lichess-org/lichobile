import round from '../round';
import settings from '../../../settings';
import crazyDrag from './crazyDrag';
import { drag as chessgroundDrag } from 'chessground-mobile';
import gameApi from '../../../lichess/game';
import m from 'mithril';

const pieceRoles = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export default {
  pocket: function(ctrl, color, position) {
    const step = round.plyStep(ctrl.data, ctrl.vm.ply);
    if (!step.crazy) return null;
    const pocket = step.crazy.pockets[color === 'white' ? 0 : 1];
    const usablePos = position === (ctrl.vm.flip ? 'top' : 'bottom');
    const usable = usablePos && !ctrl.replaying() && gameApi.isPlayerPlaying(ctrl.data);
    const className = [
      settings.general.theme.piece(),
      'pocket',
      position,
      usable ? 'usable' : ''
    ].join(' ');

    return m('div', {
        className,
        config: function(el, isUpdate, ctx) {
          if (!isUpdate) {
            const onstart = crazyDrag.bind(undefined, ctrl);
            const onmove = chessgroundDrag.move.bind(undefined, ctrl.chessground.data);
            const onend = chessgroundDrag.end.bind(undefined, ctrl.chessground.data);
            el.addEventListener('touchstart', onstart);
            document.addEventListener('touchmove', onmove);
            document.addEventListener('touchend', onend);
            ctx.onunload = function() {
              el.removeEventListener('touchstart', onstart);
              document.removeEventListener('touchmove', onmove);
              document.removeEventListener('touchend', onend);
            };
          }
          if (ctx.flip === ctrl.vm.flip || !usablePos) return;
          ctx.flip = ctrl.vm.flip;
        }
      },
      pieceRoles.map(function(role) {
        return m('piece', {
          'data-role': role,
          'data-color': color,
          'data-nb': pocket[role] || 0,
          className: role + ' ' + color
        });
      })
    );
  }
};
