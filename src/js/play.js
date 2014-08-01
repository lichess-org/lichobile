'use strict';

var Game = require('./game'),
ajax = require('./ajax'),
render = require('./render'),
settings = require('./settings'),
storage = require('./storage'),
signals = require('./signals'),
utils = require('./utils'),
_ = require('lodash'),
alert = require('./alert'),
StrongSocket = require('./socket');

var ground, game, socket;

var onMove = function(from, to) {
  socket.send('move', { from: from, to: to });
};

ground = render.ground({
  movable: { free: false, color: "none", events: { after: onMove }}
});

function handleEndGame() {
  ajax({ url: game.url.end, method: 'GET'}).done(function(data) {
    if (data.winner && data.winner.isMe) alert.show('info', '<strong>Yeah!</strong> You won :)');
    else if (data.winner) alert.show('info', '<strong>Oops!</strong> You lost :D');
    else alert.show('info', '<strong>Oh!</strong> That\'s a draw :\\');
  });
}

function stop() {
  socket.destroy();
  if (window.cordova) window.plugins.insomnia.allowSleepAgain();
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
  threefoldRepetition: function() {
    if (settings.general.threeFoldAutoDraw()) {
      socket.send('draw-claim', {});
    } else {
      alert.show(
        'info',
        'Threefold repetition detected: <button data-bind="tap: claimDraw" class="btn">claim draw!</button>'
      );
    }
  },
  end: function() {
    game.updateClocks();
    game.finish();
    stop();
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

  // save current game id
  storage.set('currentGame', game.url.pov);

  // initialize socket connection
  socket = new StrongSocket(
    game.url.socket,
    game.player.version,
    {
      options: { name: "game", debug: true },
      events: gameEvents
    }
  );

  // initialize ground and ui
  if (game.hasClock()) {
    game.setClocks(utils.$('#opp-clock'), utils.$('#player-clock'));
  }

  if (game.getFen()) {
    ground.setFen(game.getFen());
  }

  ground.setDests(game.getPossibleMoves());
  ground.setColor(game.currentPlayer());

  if (game.player.color === 'black') {
    ground.toggleOrientation();
    if (game.currentTurn() === 1) {
      ground.showLastMove(game.lastMove().from, game.lastMove().to);
    }
  }

  // listen to buzzer event to notify server when time is out
  signals.buzzer.add(function() {
    if (!game.isFinished()) {
      outOfTime();
    }
  });

  // listen to claimDraw event to notify server when a draw is claimed
  signals.claimDraw.add(function() {
    socket.send('draw-claim', {});
  });

  // disable sleep during play
  if (window.cordova && settings.general.disableSleep()) window.plugins.insomnia.keepAwake();
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

function startAI() {

  alert.hideAll();
  reset();

  return ajax({ url: '/setup/ai', method: 'POST', data: {
    variant: settings.game.ai.variant(),
    clock: settings.game.ai.clock(),
    time: settings.game.ai.time(),
    increment: settings.game.ai.increment(),
    level: settings.game.ai.aiLevel(),
    color: settings.game.ai.color()
  }}).then(function(data) {
    // update game data from server
    console.log(data);
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

function startHuman(id) {
  alert.hideAll();
  reset();

  resume(id);
}

module.exports = {
  startAI: startAI,
  startHuman: startHuman,
  resume: resume,
  stop: stop
};
