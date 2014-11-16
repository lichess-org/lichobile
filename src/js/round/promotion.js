var chessground = require('chessground');
var partial = chessground.util.partial;
var ground = require('./ground');
var xhr = require('./roundXhr');

var promoting = false;

function start(ctrl, orig, dest, isPremove) {
  var piece = ctrl.chessground.data.pieces[dest];
  if (piece && piece.role == 'pawn' && (
    (dest[1] == 8 && ctrl.data.player.color == 'white') ||
    (dest[1] == 1 && ctrl.data.player.color == 'black'))) {
    if (ctrl.data.pref.autoQueen == 3 || (ctrl.data.pref.autoQueen == 2 && isPremove)) return false;
    m.startComputation();
    promoting = [orig, dest];
    m.endComputation();
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

module.exports = {

  start: start,

  view: function(ctrl) {
    return promoting ? m('div#promotion_choice', {
      onclick: partial(cancel, ctrl)
    }, ['queen', 'knight', 'rook', 'bishop'].map(function(role) {
      return m('div.cg-piece.' + role + '.' + ctrl.data.player.color, {
        onclick: function(e) {
          e.stopPropagation();
          finish(ctrl, role);
        }
      });
    })) : null
  }
};
