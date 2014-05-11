/* lichess-mobile application entry point */

'use strict';

var ChessBoard = require('./chessboard'),
    Qajax = require('qajax'),
    StrongSocket = require('./socket');

var board;

// do not pick up pieces if the game is over
// only pick up pieces for White
var onDragStart = function(source, piece, position, orientation) {
};

var onDrop = function(source, target) {
};

var onSnapEnd = function() {
};

Qajax({
  headers: { 'Accept': 'application/vnd.lichess.v1+json' },
  url: '/setup/ai',
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
  var socket = new StrongSocket(
    data.url.socket,
    data.player.version,
    { options: { debug: true }}
  );
}, function(err) {
  console.log('post request to lichess failed', err);
});


var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

board = new ChessBoard('board', cfg);
board.resize();
