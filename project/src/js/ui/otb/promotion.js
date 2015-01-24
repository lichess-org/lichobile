var chessground = require('chessground');
var partial = chessground.util.partial;
var utils = require('../../utils');

var promoting = false;

function promote(ground, key, role) {
  var pieces = {};
  var piece = ground.data.pieces[key];
  if (piece && piece.role === 'pawn') {
    pieces[key] = {
      color: piece.color,
      role: role
    };
    ground.setPieces(pieces);
  }
}

function start(ctrl, orig, dest, isPremove) {
  var piece = ctrl.chessground.data.pieces[dest];
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '8' && ctrl.data.player.color === 'white') ||
    (dest[1] === '1' && ctrl.data.player.color === 'black'))) {
    m.startComputation();
    promoting = [orig, dest];
    m.endComputation();
    return true;
  }
  return false;
}

function finish(ground, role) {
  if (promoting) promote(ground, promoting[1], role);
  promoting = false;
}

function cancel() {
  promoting = false;
}

module.exports = {

  start: start,

  view: function(ctrl) {
    return promoting ? m('div.overlay', [m('div#promotion_choice', {
      config: utils.ontouchend(partial(cancel)),
      style: { top: (utils.getViewportDims().vh - 100) / 2 + 'px' }
    }, ['queen', 'knight', 'rook', 'bishop'].map(function(role) {
      return m('div.cg-piece.' + role + '.' + ctrl.data.player.color, {
        config: utils.ontouchend(utils.ƒ(finish, ctrl.chessground, role))
      });
    }))]) : null;
  }
};
