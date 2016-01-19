import chessground from 'chessground-mobile';
import ground from './ground';
import * as xhr from './roundXhr';
import helper from '../helper';
import settings from '../../settings';
import m from 'mithril';

const partial = chessground.util.partial;

var promoting = false;

function start(ctrl, orig, dest, isPremove) {
  var piece = ctrl.chessground.data.pieces[dest];
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '8' && ctrl.data.player.color === 'white') ||
    (dest[1] === '1' && ctrl.data.player.color === 'black'))) {
    if (ctrl.data.pref.autoQueen === 3 || (ctrl.data.pref.autoQueen === 2 && isPremove)) return false;
    promoting = [orig, dest];
    m.redraw();
    return true;
  }
  return false;
}

function finish(ctrl, role) {
  if (promoting) {
    ground.promote(ctrl.chessground, promoting[1], role);
    ctrl.sendMove(promoting[0], promoting[1], role);
  }
  promoting = false;
}

function cancel(ctrl) {
  if (promoting) xhr.reload(ctrl).then(ctrl.reload);
  promoting = false;
}

export default {

  start: start,

  view: function(ctrl) {
    if (!promoting) return null;

    const pieces = ['queen', 'knight', 'rook', 'bishop'];
    if (ctrl.data.game.variant.key === 'antichess') pieces.push('king');

    return m('div.overlay.open', {
      config: helper.ontouch(partial(cancel, ctrl))
    }, [m('div#promotion_choice', {
      className: settings.general.theme.piece(),
      style: { top: (helper.viewportDim().vh - 100) / 2 + 'px' }
    }, pieces.map(function(role) {
      return m('piece.' + role + '.' + ctrl.data.player.color, {
        config: helper.ontouch(finish.bind(undefined, ctrl, role))
      });
    }))]);
  }
};
