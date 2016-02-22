import m from 'mithril';
import ground from './ground';
import { oppositeColor, partialf } from '../../utils';
import { key2pos, invertKey } from 'chessground-mobile';

var promoting = false;

function start(ctrl, orig, dest, callback) {
  var piece = ctrl.chessground.data.pieces[dest];
  if (piece && piece.role === 'pawn' && (
    (dest[1] === 8 && ctrl.chessground.data.turnColor === 'black') ||
    (dest[1] === 1 && ctrl.chessground.data.turnColor === 'white'))) {
    promoting = {
      orig: orig,
      dest: dest,
      callback: callback
    };
    m.redraw();
    return true;
  }
  return false;
}

function finish(ctrl, role) {
  if (promoting) ground.promote(ctrl.chessground, promoting.dest, role);
  if (promoting.callback) promoting.callback(promoting.orig, promoting.dest, role);
  promoting = false;
}

function cancel(ctrl) {
  if (promoting) {
    promoting = false;
    ctrl.chessground.set(ctrl.vm.cgConfig);
    m.redraw();
  }
}

function renderPromotion(ctrl, dest, pieces, color, orientation) {
  if (!promoting) return null;
  var left = (key2pos(orientation === 'white' ? dest : invertKey(dest))[0] - 1) * 12.5;
  var vertical = color === orientation ? 'top' : 'bottom';

  return m('div#promotion_choice.' + vertical, {
    onclick: partialf(cancel, ctrl)
  }, pieces.map(function(serverRole, i) {
    return m('square', {
      style: vertical + ': ' + i * 12.5 + '%;left: ' + left + '%',
      onclick: function(e) {
        e.stopPropagation();
        finish(ctrl, serverRole);
      }
    }, m('piece.' + serverRole + '.' + color));
  }));
}

export default {

  start,

  cancel,

  view(ctrl) {
    if (!promoting) return null;
    var pieces = ['queen', 'knight', 'rook', 'bishop'];
    if (ctrl.data.game.variant.key === 'antichess') pieces.push('king');

    return renderPromotion(ctrl, promoting.dest, pieces,
      oppositeColor(ctrl.chessground.data.turnColor),
      ctrl.chessground.data.orientation);
  }
};
