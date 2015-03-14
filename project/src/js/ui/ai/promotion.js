var chessground = require('chessground');
var partial = chessground.util.partial;
var utils = require('../../utils');
var helper = require('../helper');

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

function start(ctrl, orig, dest, callback) {
  var piece = ctrl.chessground.data.pieces[dest];
  if (piece && piece.role === 'pawn' && (
    (dest[1] === '1' && ctrl.chessground.data.turnColor === 'white') ||
    (dest[1] === '8' && ctrl.chessground.data.turnColor === 'black'))) {
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

function finish(ground, role) {
  if (promoting) promote(ground, promoting.dest, role);
  if (promoting.callback) promoting.callback(promoting.orig, promoting.dest, role);
  promoting = false;
}

function cancel() {
  promoting = false;
}

module.exports = {

  start: start,

  view: function(ctrl) {
    return promoting ? m('div.overlay', [m('div#promotion_choice', {
      config: helper.ontouchend(partial(cancel)),
      style: { top: (utils.getViewportDims().vh - 100) / 2 + 'px' }
    }, ['queen', 'knight', 'rook', 'bishop'].map(function(role) {
      return m('div.cg-piece.' + role + '.' + ctrl.data.player.color, {
        config: helper.ontouchend(utils.f(finish, ctrl.chessground, role))
      });
    }))]) : null;
  }
};
