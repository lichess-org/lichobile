import redraw from '../../../utils/redraw';
import * as helper from '../../helper';
import settings from '../../../settings';
import * as h from 'mithril/hyperscript';
import { PromotingInterface } from '../round'

type PromoteCallback = (orig: Pos, dest: Pos, prom: Role) => void
interface Promoting {
  orig: Pos
  dest: Pos
  callback: PromoteCallback
}

let promoting: Promoting = null

function promote(ground: Chessground.Controller, key: Pos, role: Role) {
  const pieces = {};
  const piece = ground.data.pieces[key];
  if (piece && piece.role === 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    };
    ground.setPieces(pieces);
  }
}

function start(chessground: Chessground.Controller, orig: Pos, dest: Pos, callback: PromoteCallback) {
  const piece = chessground.data.pieces[dest];
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '1' && chessground.data.turnColor === 'white') ||
    (dest[1] === '8' && chessground.data.turnColor === 'black'))) {
    promoting = {
      orig: orig,
      dest: dest,
      callback: callback
    };
    redraw();
    return true;
  }
  return false;
}

function finish(ground: Chessground.Controller, role: Role) {
  if (promoting) promote(ground, promoting.dest, role);
  if (promoting.callback) promoting.callback(promoting.orig, promoting.dest, role);
  promoting = null;
}

function cancel(chessground: Chessground.Controller, cgConfig: Chessground.SetConfig) {
  if (promoting) {
    promoting = null;
    chessground.set(cgConfig);
    redraw();
  }
}

export function view(ctrl: PromotingInterface) {
  if (!promoting) return null

  const pieces = ['queen', 'knight', 'rook', 'bishop'];
  if (ctrl.data && ctrl.data.game.variant.key === 'antichess') {
    pieces.push('king');
  }

  return h('div.overlay.open', [h('div#promotion_choice', {
    className: settings.general.theme.piece(),
    style: { top: (helper.viewportDim().vh - 100) / 2 + 'px' }
  }, pieces.map((role: Role) => {
    return h('piece.' + role + '.' + ctrl.player(), {
      oncreate: helper.ontap(() => finish(ctrl.chessground, role))
    });
  }))])
}

export default {
  start,
  cancel
};
