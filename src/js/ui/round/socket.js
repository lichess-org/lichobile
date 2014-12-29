var round = require('./round');
var ground = require('./ground');
var xhr = require('./roundXhr');
var sound = require('../../sound');
var session = require('../../session');

module.exports = function(send, ctrl) {

  this.send = send;

  var handlers = {
    possibleMoves: function(o) {
      ctrl.data.possibleMoves = o;
      if (!ctrl.replay.active) ctrl.chessground.set({
        movable: {
          dests: round.parsePossibleMoves(o)
        }
      });
    },
    state: function(o) {
      if (!ctrl.replay.active) ctrl.chessground.set({
        turnColor: o.color
      });
      ctrl.data.game.player = o.color;
      ctrl.data.game.turns = o.turns;
      m.redraw();
      ctrl.setTitle();
    },
    move: function(o) {
      ctrl.apiMove(o);
      sound.move();
    },
    premove: function() {
      ctrl.chessground.playPremove();
    },
    castling: function(o) {
      if (ctrl.replay.active) return;
      var pieces = {};
      pieces[o.king[0]] = null;
      pieces[o.rook[0]] = null;
      pieces[o.king[1]] = {
        role: 'king',
        color: o.color
      };
      pieces[o.rook[1]] = {
        role: 'rook',
        color: o.color
      };
      ctrl.chessground.setPieces(pieces);
    },
    check: function(o) {
      if (!ctrl.replay.active) ctrl.chessground.set({
        check: o
      });
    },
    enpassant: function(o) {
      var pieces = {};
      pieces[o] = null;
      if (!ctrl.replay.active) ctrl.chessground.setPieces(pieces);
      sound.capture();
    },
    reload: function() {
      xhr.reload(ctrl).then(ctrl.reload);
    },
    redirect: function(e) {
      m.route('/play/' + e.id);
    },
    threefoldRepetition: function() {
      ctrl.data.game.threefold = true;
      m.redraw();
    },
    promotion: function(o) {
      ground.promote(ctrl.chessground, o.key, o.pieceClass);
    },
    clock: function(o) {
      if (ctrl.clock) ctrl.clock.update(o.white, o.black);
    },
    end: function() {
      ground.end(ctrl.chessground);
      xhr.reload(ctrl).then(ctrl.reload);
      if (!ctrl.data.player.spectator) sound.dong();
      window.plugins.insomnia.allowSleepAgain();
      // refresh current games card list
      session.refresh();
      setTimeout(function() {
        ctrl.vm.showingActions = true;
        m.redraw();
      }, 1000);
    },
    gone: function(isGone) {
      // if (!ctrl.data.opponent.ai) {
      //   round.setIsGone(ctrl.data, ctrl.data.opponent.color, isGone);
      //   m.redraw();
      // }
    },
  };

  this.receive = function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  }.bind(this);
};
