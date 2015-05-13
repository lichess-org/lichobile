var gameApi = require('../../lichess/game');
var ground = require('./ground');
var xhr = require('./roundXhr');
var sound = require('../../sound');
var session = require('../../session');
var utils = require('../../utils');
var atomic = require('./atomic');

module.exports = function(ctrl, onFeatured) {

  var handlers = {
    possibleMoves: function(o) {
      ctrl.data.possibleMoves = o;
      if (!ctrl.replay.active) ctrl.chessground.set({
        movable: {
          dests: gameApi.parsePossibleMoves(o)
        }
      });
    },
    state: function(o) {
      if (!ctrl.replay.active) ctrl.chessground.set({
        turnColor: o.color
      });
      ctrl.data.game.player = o.color;
      ctrl.data.game.turns = o.turns;
      if (o.status) ctrl.data.game.status = o.status;
      ctrl.data[ctrl.data.player.color === 'white' ? 'player' : 'opponent'].offeringDraw = o.wDraw;
      ctrl.data[ctrl.data.player.color === 'black' ? 'player' : 'opponent'].offeringDraw = o.bDraw;
      m.redraw();
      ctrl.setTitle();
    },
    takebackOffers: function(o) {
      ctrl.data.player.proposingTakeback = o[ctrl.data.player.color];
      ctrl.data.opponent.proposingTakeback = o[ctrl.data.opponent.color];
      m.redraw();
    },
    move: function(o) {
      ctrl.apiMove(o);
    },
    premove: function() {
      ctrl.chessground.playPremove();
    },
    castling: function(o) {
      if (ctrl.replay.active || ctrl.chessground.data.autoCastle) return;
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
      if (!ctrl.replay.active) {
        var pieces = {};
        pieces[o.key] = null;
        ctrl.chessground.setPieces(pieces);
        if (ctrl.data.game.variant.key === 'atomic')
          atomic.enpassant(ctrl, o.key, o.color);
      }
      sound.capture();
    },
    checkCount: function(e) {
      var isWhite = ctrl.data.player.color === 'white';
      ctrl.data.player.checks = isWhite ? e.white : e.black;
      ctrl.data.opponent.checks = isWhite ? e.black : e.white;
      m.redraw();
    },
    reload: function() {
      xhr.reload(ctrl).then(ctrl.reload);
    },
    redirect: function(e) {
      if (!ctrl.data.tv) m.route('/game/' + e.id);
    },
    resync: function() {
      xhr.reload(ctrl).then(function(data) {
        if (ctrl.socket) ctrl.socket.setVersion(data.player.version);
        ctrl.reload(data);
      }, function(err) {
        utils.handleXhrError(err);
      });
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
    cclock: function(o) {
      if (ctrl.correspondenceClock) ctrl.correspondenceClock.update(o.white, o.black);
    },
    end: function() {
      ground.end(ctrl.chessground);
      xhr.reload(ctrl).then(ctrl.reload);
      if (!ctrl.data.player.spectator) sound.dong();
      window.plugins.insomnia.allowSleepAgain();
      // refresh current games card list
      if (session.isConnected()) session.refresh();
      setTimeout(function() {
        ctrl.showActions();
        m.redraw();
      }, 1000);
    },
    gone: function(isGone) {
      if (!ctrl.data.opponent.ai) {
        gameApi.setIsGone(ctrl.data, ctrl.data.opponent.color, isGone);
        m.redraw();
      }
    },
    message: function(m) {
      if (ctrl.chat) ctrl.chat.append(m);
    },
    featured: function(o) {
      if (ctrl.data.tv && onFeatured) onFeatured(o);
    }
  };

  return function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  };
};
