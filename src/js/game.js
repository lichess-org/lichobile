'use strict';

var Chessground = require('chessground');
var m           = require('mithril');
var model       = require('./model');
var clock       = require('./clock');
var StrongSocket = require('./socket');

var controller = function() {

  var ground, socket, game;

  function onMove(from, to) {
    socket.sendAckable('move', { from: from, to: to });
  }

  var gameEvents = {
    possibleMoves: function(e) {
      game.setPossibleMoves(e);
      ground.reconfigure({
        movable: {
          dests: game.getPossibleMoves()
        }
      });
    },
    move: function(e) {
      if (e.color !== game.player.color) {
        ground.apiMove(e.from, e.to);
      }
    },
    promotion: function(e) {
      var pieces = {};
      pieces[e.key] = { color: game.lastPlayer(), role: 'queen'};
      ground.setPieces(pieces);
    },
    enpassant: function(e) {
      var pieces = {};
      pieces[e] = null;

      ground.setPieces(pieces);
    },
    check: function(e) {
      ground.reconfigure({check: e});
    },
    clock: function(e) {
      // game.updateClocks(e);
    },
    threefoldRepetition: function() {
    },
    end: function() {
      game.updateClocks();
      game.finish();
    },
    state: function(e) {
      game.updateState(e);
      ground.reconfigure({turnColor: game.currentPlayer()});
    },
    castling: function(e) {
      var pieces = {};
      // ground.getPosition(function(pos) {
      //   pieces[e.rook[0]] = null;
      //   pieces[e.rook[1]] = pos[e.rook[0]];
      //   ground.setPieces(pieces);
      // });
    },
    reloadTable: function () {
    },
    redirect: function () {
    },
    resync: function () {
    },
    message: function () {
    },
    premove: function () {
      ground.playPremove();
    }
  };

  ground = new Chessground.controller({
    orientation: 'white',
    movable: {
      free: false,
      color: null,
      events: {
        after: onMove.bind(this)
      }
    },
    premovable: {
      enabled: true
    }
  });

  function startAiGame() {
    model.aiGame().then(function(data) {
      game = data;
      socket = new StrongSocket(
        game.url.socket,
        game.player.version,
        {
          options: { name: "game", debug: true },
          events: gameEvents
        }
      );
      var lm = game.lastMove();
      ground.reconfigure({
        fen: game.getFen() ? game.getFen() : 'start',
        orientation: game.player.color,
        turnColor: game.currentPlayer(),
        lastMove: lm ? [lm.from, lm.to] : null,
        movable: {
          color: game.player.color,
          dests: game.getPossibleMoves()
        }
      });
      console.log(game, ground);
      m.redraw();
    });
  }

  function startClock() {
    if (game && game.hasClock()) {
      return {
        player: new clock.controller(game.clock[game.player.color], ".timer.after", game.clock.initial),
        opponent: new clock.controller(game.clock[model.negate(game.player.color)], ".timer.before", game.clock.initial)
      };
    }

    return null;
  }

  return {
    startAiGame: startAiGame,
    startClock: startClock,
    ground: ground
  };
};

var view = function(ctrl) {
  function renderGame(ctrl){
    return m('div', [
        renderOpponent(ctrl),
        renderBoard(ctrl),
        renderPlayer(ctrl),
        m('button', { config: function(el, isUpdate) {
          if (!isUpdate) el.addEventListener('touchstart', ctrl.startAiGame);
        }}, 'Start!')
    ]);
  }

  function renderPlayer(ctrl){
    var children = [
      m('h1', 'player'),
      m('span', '1459')
    ];
    if (ctrl.startClock()) children.push(clock.view(ctrl.startClock().player), m('div.timer.after'));
    return m('div.player', children);
  }

  function renderOpponent(ctrl){
    // var name  = ( "id" in ctrl.game.opponent ? ctrl.game.opponent.id : "AI" );
    var children = [
      m('h1', 'ai'),
      m('span', '1459')
    ];
    if (ctrl.startClock()) children.push(clock.view(ctrl.startClock().opponent), m('div.timer.before'));

    return m('div.opponent', children);
  }

  function renderBoard(ctrl){
    return m('div.chessground.wood.merida', [
      Chessground.view(ctrl.ground)
    ]);
  }

  return renderGame(ctrl);
};

module.exports = {
  controller: controller,
  view: view
};
