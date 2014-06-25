/* lichess-mobile application entry point */

'use strict';

var Qajax = require('qajax'),
Chessground = require('./vendor/chessground'),
Game = require('./game'),
$ = require('./vendor/zepto'),
Elements = require('./elements'),
StrongSocket = require('./socket');

var board, game, socket;

function main() {

  var onMove = function(from, to) {
    socket.send('move', { from: from, to: to });
  };

  function setBoard() {
    var cfg = {
      movable: {
        free: false,
        events: {
          after: onMove
        }
      }
    };

    board = window.board = Chessground.main(document.getElementById('board'), cfg);

    var cHeight = $('body > .content').height();
    var bHeight = Elements.board.height();
    var size = $('body').width() - 5;
    Elements.board.css({
      position: 'absolute',
      top: (cHeight - bHeight) / 2,
      left: 2,
    });
    Elements.board.width(size).height(size);
  }

  setBoard();

  $('#play-button').tap(function() {

    if (game) game = undefined;
    if (socket) socket = undefined;
    if (board.getOrientation() === 'black') board.toggleOrientation();
    board.startPos();

    Qajax({
      headers: { 'Accept': 'application/vnd.lichess.v1+json', 'X-Requested-With': 'XMLHttpRequest' },
      url: window.apiEndPoint + '/setup/ai',
      method: 'POST',
      data: {
        variant: 1,
        clock: true,
        time: 5,
        increment: 3,
        level: 1,
        color: 'random'
      }
    }).then(Qajax.filterSuccess).then(Qajax.toJSON).done(function(data) {
      console.log(data);
      game = Game(data);

      socket = new StrongSocket(
        data.url.socket,
        data.player.version,
        {
          options: { debug: true },
          events: {
            possibleMoves: function(e) {
              game.setPossibleMoves(e);
              board.setDests(game.getPossibleMoves());
            },
            move: function(e) {
              if (game.isOpponentToMove(e.color)) {
                board.move(e.from, e.to);
              }
            },
            promotion: function(e) {
              var pieces = {};
              pieces[e.key] = { color: game.lastPlayer(), role: 'queen'};
              board.setPieces(pieces);
            },
            enpassant: function(e) {
              var pieces = {};
              pieces[e] = null;

              board.setPieces(pieces);
            },
            // check: function(e) {
            // },
            clock: function(e) {
              game.updateClocks(e);
            },
            end: function() {
              console.log('game finished');
              game.finish();
            },
            state: function(e) {
              game.updateState(e);
              board.setColor(game.currentPlayer());
            },
            castling: function(e) {
              var pieces = {};
              var pos = board.getPosition();
              pieces[e.rook[0]] = null;
              pieces[e.rook[1]] = pos[e.rook[0]];
              board.setPieces(pieces);
            }
          }
        }
      );

      if (game.hasClock()) {
        var boardPos = Elements.board.position();
        var leftPos = (Elements.board.width() - 70) / 2;
        var $topClock = $('#top-clock').css({
          position: 'absolute',
          top: boardPos.top - 25,
          left: leftPos
        });
        var $botClock = $('#bot-clock').css({
          position: 'absolute',
          top: boardPos.top + Elements.board.height(),
          left: leftPos
        });
        game.setClocks($topClock, $botClock);
      }

      if (game.getFen()) {
        board.setFen(game.getFen());
      }

      board.setDests(game.getPossibleMoves());
      board.setColor(game.currentPlayer());

      if (game.currentPlayer() === 'black') {
        board.toggleOrientation();
        board.move(game.lastMove().from, game.lastMove().to);
      }

      game.startClock();

    }, function(err) {
      console.log('post request to lichess failed', err);
    });

  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
