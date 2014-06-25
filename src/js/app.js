/* lichess-mobile application entry point */

'use strict';

var Qajax = require('qajax'),
Game = require('./game'),
$ = require('./vendor/zepto'),
Elements = require('./elements'),
ground = require('./ground'),
StrongSocket = require('./socket');

var ground, game, socket;

function main() {

  var onMove = function(from, to) {
    socket.send('move', { from: from, to: to });
  };

  ground = ground({movable: { events: { after: onMove }}});

  $('#play-button').tap(function() {

    if (game) game = undefined;
    if (socket) socket = undefined;
    if (ground.getOrientation() === 'black') ground.toggleOrientation();
    ground.startPos();

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
              ground.setDests(game.getPossibleMoves());
            },
            move: function(e) {
              if (game.isOpponentToMove(e.color)) {
                ground.move(e.from, e.to);
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
              ground.setColor(game.currentPlayer());
            },
            castling: function(e) {
              var pieces = {};
              var pos = ground.getPosition();
              pieces[e.rook[0]] = null;
              pieces[e.rook[1]] = pos[e.rook[0]];
              ground.setPieces(pieces);
            }
          }
        }
      );

      if (game.hasClock()) {
        var groundPos = Elements.ground.position();
        var leftPos = (Elements.ground.width() - 70) / 2;
        var $topClock = $('#top-clock').css({
          position: 'absolute',
          top: groundPos.top - 25,
          left: leftPos
        });
        var $botClock = $('#bot-clock').css({
          position: 'absolute',
          top: groundPos.top + Elements.ground.height(),
          left: leftPos
        });
        game.setClocks($topClock, $botClock);
      }

      if (game.getFen()) {
        ground.setFen(game.getFen());
      }

      ground.setDests(game.getPossibleMoves());
      ground.setColor(game.currentPlayer());

      if (game.currentPlayer() === 'black') {
        ground.toggleOrientation();
        ground.move(game.lastMove().from, game.lastMove().to);
      }

      game.startClock();

    }, function(err) {
      console.log('post request to lichess failed', err);
    });

  });

}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
