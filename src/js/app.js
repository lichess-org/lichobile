/* lichess-mobile application entry point */

'use strict';

var ChessBoard = require('./vendor/chessboard'),
    Qajax = require('qajax'),
    StrongSocket = require('./socket');

var board, player;

function isOpponentMove(d) {
  return d.color !== player;
}

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
  console.log(data.game);
  player = data.game.player;

  var socket = new StrongSocket(
    data.url.socket,
    data.player.version,
    {
      options: { debug: true },
      events: {
        move: function(e) {
          console.log('move', e);
          if (isOpponentMove(e)) {
            board.move(e.from + '-' + e.to);
          }
        }
      }
    }
  );

  // var onDragStart = function(source, piece, position, orientation) {
  // };

  // var onSnapEnd = function() {
  // };

  var onDrop = function(source, target) {
    console.log('dropped move: ' + source + ' ' + target);
    socket.send('move', { from: source, to: target });
  };

  var cfg = {
    draggable: true,
    position: 'start',
    onDrop: onDrop
  };

  board = new ChessBoard('board', cfg);
  board.resize();

  if (player === 'black') {
    var firstmove = data.game.lastMove.substr(0,2) + '-' + data.game.lastMove.substr(2, 2);
    console.log(firstmove);
    board.move(firstmove);
  }

}, function(err) {
  console.log('post request to lichess failed', err);
});


