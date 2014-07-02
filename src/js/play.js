'use strict';


var Game = require('./game'),
ajax = require('./ajax'),
render = require('./render'),
settings = require('./settings'),
storage = require('./storage'),
signals = require('./signals'),
_ = require('lodash'),
alert = require('./alert'),
StrongSocket = require('./socket');

var ground, game, socket;

var onMove = function(from, to) {
  socket.send('move', { from: from, to: to });
};

ground = render.ground({movable: { events: { after: onMove }}});


function handleEndGame() {
  ajax({ url: game.url.end, method: 'GET'}).done(function(data) {
    if (data.winner.isMe) alert('info', '<strong>Yeah!</strong> You won :)');
    else alert('info', '<strong>Hihihi!</strong> You lose :D');
  });
}

var gameEvents = {
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
    handleEndGame();
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
};

var outOfTime = _.throttle(function() {
  socket.send('outoftime');
}, 200);

function initializeGame() {
  var clockEls;

  // save current game id
  storage.set('currentGame', game.url.pov);

  // initialize socket connection
  socket = new StrongSocket(
    game.url.socket,
    game.player.version,
    { options: { debug: true }, events: gameEvents }
  );

  // initialize ground and ui
  if (game.hasClock()) {
    clockEls = render.clocks();
    game.setClocks(clockEls.top, clockEls.bot);
  }

  if (game.getFen()) {
    ground.setFen(game.getFen());
  }

  ground.setDests(game.getPossibleMoves());
  ground.setColor(game.currentPlayer());

  if (game.player.color === 'black') {
    ground.toggleOrientation();
    if (game.currentTurn() === 1) {
      ground.showMoved(game.lastMove().from, game.lastMove().to);
    }
  }

  // listen to buzzer event to notify server when time is out
  signals.buzzer.add(function() {
    if (!game.isFinished()) {
      outOfTime();
    }
  });

}

function reset() {

  if (game) {
    if (game.hasClock()) game.stopClocks();
    game = null;
  }
  if (socket) socket = null;
  if (ground.getOrientation() === 'black') ground.toggleOrientation();
  ground.startPos();
}

function start() {

  reset();

  return ajax({ url: '/setup/ai', method: 'POST', data: {
    variant: settings.variant(),
    clock: settings.clock(),
    time: settings.time(),
    increment: settings.increment(),
    level: settings.aiLevel(),
    color: settings.color()
  }}).then(function(data) {
    // update game data from server
    game = Game(data);

    initializeGame();

    return game;
  }, function(err) {
    console.log('post request to lichess failed', err);
  });
}

function resume(id) {

  if (!id) return;

  return ajax({ url: id, method: 'GET'}).then(function(data) {
    // update game data
    game = Game(data);

    initializeGame();

    if (game.currentTurn() > 1) game.updateClocks();

    return game;
  }, function(err) {
    console.log('request to lichess failed', err);
  });
}

module.exports = {
  start: start,
  resume: resume,
  handleEndGame: handleEndGame
};
