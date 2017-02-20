import * as h from 'mithril/hyperscript';
import redraw from '../../../utils/redraw';
import settings from '../../../settings';
import * as helper from '../../helper';
import ground from './ground';
import * as xhr from './roundXhr';
import { OnlineRoundInterface } from '.'

let promoting: [Pos, Pos] = null;

function start(ctrl: OnlineRoundInterface, orig: Pos, dest: Pos, isPremove: boolean) {
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

function finish(ctrl: OnlineRoundInterface, role: Role) {
  if (promoting) {
    ground.promote(ctrl.chessground, promoting[1], role);
    ctrl.sendMove(promoting[0], promoting[1], role);
  }
  promoting = null;
}

function cancel(ctrl: OnlineRoundInterface) {
  if (promoting) xhr.reload(ctrl).then(ctrl.reload);
  promoting = null;
}

export default {

  start: start,

  view: function(ctrl: OnlineRoundInterface) {
    if (!promoting) return null;

    const pieces = ['queen', 'knight', 'rook', 'bishop'];
    if (ctrl.data.game.variant.key === 'antichess') pieces.push('king');

    return h('div.overlay.open', {
      oncreate: helper.ontap(cancel.bind(undefined, ctrl))
    }, [h('div#promotion_choice', {
      className: settings.general.theme.piece(),
      style: { top: (helper.viewportDim().vh - 100) / 2 + 'px' }
    }, pieces.map(function(role) {
      return h('piece.' + role + '.' + ctrl.data.player.color, {
        oncreate: helper.ontap(finish.bind(undefined, ctrl, role))
      });
    }))]);
  }
};
