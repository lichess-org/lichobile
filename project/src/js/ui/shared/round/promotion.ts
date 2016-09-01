import * as m from 'mithril';
import redraw from '../../../utils/redraw';
import settings from '../../../settings';
import helper from '../../helper';
import ground from './ground';
import * as xhr from './roundXhr';
import OnlineRound from './OnlineRound';

let promoting: [Pos, Pos] = null;

function start(ctrl: OnlineRound, orig: Pos, dest: Pos, isPremove: boolean) {
  const piece = ctrl.chessground.data.pieces[dest];
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '8' && ctrl.data.player.color === 'white') ||
    (dest[1] === '1' && ctrl.data.player.color === 'black'))) {
    if (ctrl.data.pref.autoQueen === 3 || (ctrl.data.pref.autoQueen === 2 && isPremove)) return false;
    promoting = [orig, dest];
    redraw();
    return true;
  }
  return false;
}

function finish(ctrl: OnlineRound, role: Role) {
  if (promoting) {
    ground.promote(ctrl.chessground, promoting[1], role);
    ctrl.sendMove(promoting[0], promoting[1], role);
  }
  promoting = null;
}

function cancel(ctrl: OnlineRound) {
  if (promoting) xhr.reload(ctrl).then(ctrl.reload);
  promoting = null;
}

export default {

  start: start,

  view: function(ctrl: OnlineRound) {
    if (!promoting) return null;

    const pieces = ['queen', 'knight', 'rook', 'bishop'];
    if (ctrl.data.game.variant.key === 'antichess') pieces.push('king');

    return m('div.overlay.open', {
      oncreate: helper.ontouch(cancel.bind(undefined, ctrl))
    }, [m('div#promotion_choice', {
      className: settings.general.theme.piece(),
      style: { top: (helper.viewportDim().vh - 100) / 2 + 'px' }
    }, pieces.map(function(role) {
      return m('piece.' + role + '.' + ctrl.data.player.color, {
        oncreate: helper.ontouch(finish.bind(undefined, ctrl, role))
      });
    }))]);
  }
};
