'use strict';


var Game = require('./game'),
Qajax = require('qajax'),
render = require('./render'),
settings = require('./settings'),
storage = require('./storage'),
StrongSocket = require('./socket');

var ground, game, socket;

var onMove = function(from, to) {
  socket.send('move', { from: from, to: to });
};

ground = render.ground({movable: { events: { after: onMove }}});


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
    if (game.currentTurn() === 1) ground.move(game.lastMove().from, game.lastMove().to);
  }

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

  Qajax({
    headers: { 'Accept': 'application/vnd.lichess.v1+json', 'X-Requested-With': 'XMLHttpRequest' },
    url: window.apiEndPoint + '/setup/ai',
    method: 'POST',
    data: {
      variant: settings.variant(),
      clock: settings.clock(),
      time: settings.time(),
      increment: settings.increment(),
      level: settings.aiLevel(),
      color: settings.color()
    }
  }).then(Qajax.filterSuccess).then(Qajax.toJSON).done(function(data) {
    // update game data from server
    game = Game(data);

    console.log(data);

    initializeGame();

  }, function(err) {
    console.log('post request to lichess failed', err);
  });

}

function resume(id) {

  if (!id) return;

  Qajax({
    headers: { 'Accept': 'application/vnd.lichess.v1+json', 'X-Requested-With': 'XMLHttpRequest' },
    url: window.apiEndPoint + id,
    method: 'GET',
  }).then(Qajax.filterSuccess).then(Qajax.toJSON).done(function(data) {
    // update game data
    game = Game(data);

    initializeGame();

    if (game.currentTurn() > 1) game.updateClocks();

  }, function(err) {
    console.log('request to lichess failed', err);
  });

}

module.exports = {
  start: start,
  resume: resume
};
