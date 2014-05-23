/* lichess-mobile application entry point */

'use strict';

var ChessBoard = require('./vendor/chessboard'),
    Qajax = require('qajax'),
    Game = require('./game'),
    StrongSocket = require('./socket');

var board, game;

Qajax({
  headers: { 'Accept': 'application/vnd.lichess.v1+json', 'X-Requested-With': 'XMLHttpRequest' },
  url: window.apiEndPoint + '/setup/ai',
  method: 'POST',
  data: {
    variant: 1,
    clock: false,
    time: 60,
    increment: 3,
    level: 5,
    color: 'random'
  }
}).then(Qajax.filterSuccess).then(Qajax.toJSON).done(function(data) {
  console.log(data);
  game = new Game(data);

  var socket = new StrongSocket(
    data.url.socket,
    data.player.version,
    {
      options: { debug: true },
      events: {
        possibleMoves: function(e) {
          game.possibleMoves = e;
        },
        move: function(e) {
          if (game.isOpponentToMove(e.color)) {
            board.move(e.from + '-' + e.to);
          }
        },
        state: function(e) {
          game.game.player = e.color;
          game.game.turns = e.turns;
        },
        castling: function(e) {
          board.move(e.rook[0] + '-' + e.rook[1]);
        }
      }
    }
  );

  // var onSnapEnd = function() {
  // };

  var onDragStart = function(source, piece, position, orientation) {
    // allow to pick up only pieces of player color
    var re = new RegExp('^' + game.opponent.color[0]);
    if (piece.search(re) !== -1) {
      return false;
    }
  };

  var onDrop = function(from, to) {
    if (to === from || to === 'offboard') return false;
    if (!game.isMoveAllowed(from, to)) return 'snapback';

    socket.send('move', { from: from, to: to });
  };

  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop
  };

  board = new ChessBoard('board', cfg);
  board.resize();

  if (game.game.player === 'black') {
    var firstmove = game.game.lastMove.substr(0,2) + '-' + game.game.lastMove.substr(2, 2);
    board.move(firstmove);
  }

}, function(err) {
  console.log('post request to lichess failed', err);
});


