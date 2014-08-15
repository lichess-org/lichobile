'use strict';

var Game = require('./game'),
ajax = require('./ajax'),
session = require('./session'),
render = require('./render'),
settings = require('./settings'),
storage = require('./storage'),
signals = require('./signals'),
Zepto = require('./vendor/zepto'),
utils = require('./utils'),
$ = utils.$,
_ = require('lodash'),
alert = require('./alert'),
sound = require('./sound'),
StrongSocket = require('./socket');

var ground, game, socket;

var lastPosition = {};

var onMove = function(from, to) {
  if (lastPosition[to]) sound.capture();
  else sound.move();
  socket.send('move', { from: from, to: to });
};

ground = render.ground({
  movable: { free: false, color: 'none', events: { after: onMove }}
});

Zepto('#resign').tap(function () {
  socket.send('resign');
  render.hideOverlay('#inGameOverlay');
});

Zepto('.rematch-yes').tap(function () {
  socket.send('rematch-yes');
  var ov = $('#endGameOverlay');
  if (utils.isHidden($('.his', ov)))
    $('.waiting', ov).style.display = 'block';
});

Zepto('.rematch-no').tap(function () {
  socket.send('rematch-no');
  render.hideOverlay('#endGameOverlay');
});

function resetEndGameOverlay() {
  var ov = $('#endGameOverlay');
  $('.mine', ov).style.display = 'block';
  $('.his', ov).style.display = 'none';
  $('.waiting', ov).style.display = 'none';
}

function handleEndGame() {
  ajax({ url: game.url.end, method: 'GET'}).done(function(data) {
    var msg;
    if (data.winner && data.winner.isMe) msg = 'You won :)';
    else if (data.winner) msg = 'You lost :(';
    else msg = 'That\'s a draw :\\';
    utils.$('#endGameOverlay > .result').innerHTML = msg;
    render.showOverlay('#endGameOverlay');
  });
}

function stop() {
  setTimeout(function () {
    utils.$('#game-menu-icon').style.display = 'none';
    ground.setColor('none');
  }, 300);
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
      if (lastPosition[e.to]) sound.capture();
      else sound.move();
    }
    setTimeout(function () { lastPosition = ground.getPosition(); }, 100);
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
  },
  reloadTable: function () {
    // rematch offer sent?
    ajax({ url: game.url.pov, method: 'GET'}).then(function(data) {
      if (data.opponent.isOfferingRematch) {
        var ov = $('#endGameOverlay');
        $('.mine', ov).style.display = 'none';
        $('.his', ov).style.display = 'block';
      }
    });
  },
  redirect: function (e) {
    ajax({ url: e.url, method: 'GET'}).then(function(data) {
      resetEndGameOverlay();
      render.hideOverlay('#endGameOverlay');
      ground.startPos();
      resume(data);
    });
  }
};

var outOfTime = _.throttle(function() {
  socket.send('outoftime');
}, 200);

function _initGame(data) {
  // update game data
  game = Game(data);

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
    if (game.currentTurn() > 1) game.updateClocks();
  }

  if (game.getFen()) {
    ground.setFen(game.getFen());
  }

  // set players name
  var playerInfo = utils.$('#player-table > .player-info');
  var oppInfo = utils.$('#opp-table > .player-info');
  playerInfo.innerHTML = session.get().username +
  ' (' + session.get().perfs[game.perf].rating + ')';
  playerInfo.style.display = 'block';
  if (game.opponent.ai) {
    oppInfo.innerHTML = 'computer';
    oppInfo.style.display = 'block';
  } else {
    ajax({ url: '/api/user/' + game.opponent.userId, method: 'GET' }).then(function (user) {
      oppInfo.innerHTML = user.username +
      ' (' + user.perfs[game.perf].rating + ')';
      oppInfo.style.display = 'block';
    });
  }

  setTimeout(function () { lastPosition = ground.getPosition(); }, 100);

  ground.setDests(game.getPossibleMoves());
  ground.setColor(game.currentPlayer());

  if (game.player.color !== ground.getOrientation()) {
    ground.toggleOrientation();
  }
  if (game.currentTurn() === 1) {
    ground.showLastMove(game.lastMove().from, game.lastMove().to);
    sound.move();
  }

  utils.$('#game-menu-icon').style.display = 'block';

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
  if (socket) socket.destroy();
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
    _initGame(data);
    return game;
  }, function(err) {
    console.log('post request to lichess failed', err);
  });
}

function resume(game) {
  if (!game && !_.isObject(game)) return;

  _initGame(game);

  return game;
}

function startHuman(id) {

  return ajax({ url: id, method: 'GET'}).then(function(data) {
    _initGame(data);
    return game;
  }, function(err) {
    console.log('request to lichess failed', err);
  });
}

module.exports = {
  startAI: startAI,
  startHuman: startHuman,
  resume: resume,
  stop: stop,
  reset: reset
};
