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
Chat = require('./chat'),
ko = require('knockout'),
StrongSocket = require('./socket');

var ground, game, socket, chat;

var lastPosition = {};

// array of current long games where it's user's turn
// it's refreshed by network every minute
var nowPlaying = ko.observableArray();

var onMove = function(from, to) {
  if (lastPosition[to]) sound.capture();
  else sound.move();
  socket.send('move', { from: from, to: to });
  nowPlaying.remove(function (e) { return e.id === game.fullId(); });
};

ground = render.ground({
  movable: { free: false, color: 'none', events: { after: onMove }}
});

Zepto('#resign').tap(function () {
  socket.send('resign');
  render.hideOverlay('#inGameOverlay');
});

Zepto('.draw-yes').tap(function () {
  socket.send('draw-yes');
  var ov = $('#inGameOverlay');
  if (utils.isHidden($('.his.draw', ov))) {
    $('.waiting.draw', ov).style.display = 'block';
  }
});

Zepto('.draw-no').tap(function () {
  reloadGameMenu();
  socket.send('draw-no');
  $('#game-menu-icon').classList.remove('active');
  render.hideOverlay('#inGameOverlay');
});

Zepto('.takeback-yes').tap(function () {
  socket.send('takeback-yes');
  var ov = $('#inGameOverlay');
  if (utils.isHidden($('.his.takeback', ov))) {
    $('.waiting.takeback', ov).style.display = 'block';
  }
});

Zepto('.takeback-no').tap(function () {
  socket.send('takeback-no');
  reloadGameMenu();
  $('#game-menu-icon').classList.remove('active');
  render.hideOverlay('#inGameOverlay');
});

Zepto('.rematch-yes').tap(function () {
  socket.send('rematch-yes');
  var ov = $('#endGameOverlay');
  if (utils.isHidden($('.his', ov))) {
    $('.waiting', ov).style.display = 'block';
  }
});

Zepto('.rematch-no').tap(function () {
  socket.send('rematch-no');
  render.hideOverlay('#endGameOverlay');
});

Zepto('#endGameOverlay > .cancel-overlay').tap(function () {
  socket.destroy();
  if (!game.opponent.ai) $('#chat-icon').style.display = 'none';
});

Zepto('#game-menu-icon').tap(function (e) {
  e.preventDefault();
  render.showOverlay('#inGameOverlay');
});


function reloadGameMenu() {
  Zepto('#inGameOverlay > .mine').show();
  Zepto('#inGameOverlay > .his').hide();
  Zepto('#inGameOverlay .waiting').hide();
}

function handleEndGame() {
  ajax({ url: game.url.end, method: 'GET'}).done(function(data) {
    var msg;
    if (data.winner && data.winner.isMe) msg = 'You won :)';
    else if (data.winner) msg = 'You lost :(';
    else msg = 'That\'s a draw :\\';
    $('#endGameOverlay > .result').innerHTML = msg;
    render.showOverlay('#endGameOverlay');
  });
}

function end() {
  setTimeout(function () {
    $('#game-menu-icon').style.display = 'none';
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
    if (e.color !== game.player.color) {
      ground.move(e.from, e.to);
      if (lastPosition[e.to]) sound.capture();
      else sound.move();
    }
    ground.getPosition(function(p) {
      lastPosition = p;
    });
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
    ground.setCheck(e);
  },
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
    end();
    handleEndGame();
  },
  state: function(e) {
    game.updateState(e);
    if (game.isMyTurn())
      ground.setColor(game.currentPlayer());
    else
      ground.setColor('none');
  },
  castling: function(e) {
    var pieces = {};
    ground.getPosition(function(pos) {
      pieces[e.rook[0]] = null;
      pieces[e.rook[1]] = pos[e.rook[0]];
      ground.setPieces(pieces);
    });
  },
  reloadTable: function () {
    var eov = $('#endGameOverlay');
    var iov = $('#inGameOverlay');
    ajax({ url: game.url.pov, method: 'GET'}).then(function(data) {

      if (game.player.isOfferingDraw && !data.player.isOfferingDraw) {
        reloadGameMenu();
      }
      if (game.player.isProposingTakeback && !data.player.isProposingTakeback) {
        reloadGameMenu();
      }

      game.player = data.player;
      game.opponent = data.opponent;

      if (data.opponent.isOfferingRematch) {
        $('.mine', eov).style.display = 'none';
        $('.his', eov).style.display = 'block';
      }
      if (data.opponent.isProposingTakeback) {
        $('.mine.takeback', iov).style.display = 'none';
        $('.his.takeback', iov).style.display = 'block';
        $('#game-menu-icon').classList.add('active');
      }
      if (data.opponent.isOfferingDraw) {
        $('.mine.draw', iov).style.display = 'none';
        $('.his.draw', iov).style.display = 'block';
        $('#game-menu-icon').classList.add('active');
      }
    });
  },
  redirect: function (e) {
    ajax({ url: e.url, method: 'GET'}).then(function(data) {
      var ov = $('#endGameOverlay');
      $('.mine', ov).style.display = 'block';
      $('.his', ov).style.display = 'none';
      $('.waiting', ov).style.display = 'none';
      render.hideOverlay('#endGameOverlay');
      ground.setStartPos();
      resume(data);
    });
  },
  resync: function () {
    if (game) {
      reloadGameMenu();
      render.hideOverlay();
      resync();
    }
  },
  message: function (msg) {
    chat.append(msg);
  }
};

var outOfTime = _.throttle(function() {
  socket.send('outoftime');
}, 200);

function _initGame(data) {
  // update game data
  game = Game(data);

  console.log(data);

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

  // init chat
  if (!game.opponent.ai) {
    chat = Chat(socket);
    if (data.chat) {
      data.chat.forEach(function (msg) {
        chat.append(msg);
      });
    }
    $('#chat-icon').style.display = 'table-cell';
  } else {
    $('#chat-icon').style.display = 'none';
  }

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
  if (session.get()) {
    playerInfo.innerHTML = session.get().username +
    ' (' + session.get().perfs[game.perf].rating + ')';
  }
  playerInfo.style.display = 'block';
  if (game.opponent.ai) {
    oppInfo.innerHTML = 'A.I. level ' + game.opponent.ai;
    oppInfo.style.display = 'block';
  } else if (game.opponent.userId) {
    ajax({ url: '/api/user/' + game.opponent.userId, method: 'GET' }).then(function (user) {
      oppInfo.innerHTML = user.username +
      ' (' + user.perfs[game.perf].rating + ')';
      oppInfo.style.display = 'block';
    });
  } else {
    oppInfo.innerHTML = 'Anonymous';
  }

  ground.getPosition(function(p) {
    lastPosition = p;
  });

  ground.setDests(game.getPossibleMoves());
  if (game.isMyTurn()) ground.setColor(game.currentPlayer());

  ground.getOrientation(function(o) {
    if (game.player.color !== o) {
      ground.toggleOrientation();
    }
  });
  if (game.lastMove()) {
    ground.setLastMove(game.lastMove().from, game.lastMove().to);
  }
  if (game.currentTurn() === 1) {
    sound.move();
  }

  utils.$('#game-menu-icon').style.display = 'table-cell';

  // disable sleep during play
  if (window.cordova && settings.general.disableSleep()) window.plugins.insomnia.keepAwake();
}

function stop() {
  if (game) {
    if (game.hasClock()) game.stopClocks();
    game = null;
  }
  if (socket) socket.destroy();
}

function reset() {
  stop();
  $('#opp-clock').style.display = 'none';
  $('#player-clock').style.display = 'none';
  if (ground.getOrientation() === 'black') ground.toggleOrientation();
  ground.setStartPos();
}

function resync() {
  ajax({ url: game.url.pov, method: 'GET'}).then(function(data) {
    game.stopClocks();
    socket.destroy();
    resume(data);
  });
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

function bindEvents() {
  var bgNowPlayingSubscription;

  // listen to buzzer event to notify server when time is out
  signals.buzzer.add(function() {
    if (game && !game.isFinished()) {
      outOfTime();
    }
  });

  // listen to claimDraw event to notify server when a draw is claimed
  signals.claimDraw.add(function() {
    socket.send('draw-claim', {});
  });

  // listen to pause/resume native events
  if (window.cordova) {
    document.addEventListener('pause', function () {
      if (socket) socket.destroy();

      // sends notifications of current moves
      bgNowPlayingSubscription = nowPlaying.subscribeArrayChanged(function (added) {
        console.log(added);
        window.plugin.notification.local.add({
          id: added.id,
          message: 'Your turn against ' + added.opponent.username + ' (' + added.opponent.rating + ')',
          json: JSON.stringify(added),
          title: 'lichess',
          autoCancel: true
        });

      });

    }, false);

    document.addEventListener('resume', function () {
      if (socket) socket.connect();
      if (bgNowPlayingSubscription) bgNowPlayingSubscription.dispose();
    }, false);

  }
}

module.exports = {
  startAI: startAI,
  startHuman: startHuman,
  resume: resume,
  stop: stop,
  reset: reset,
  nowPlaying: nowPlaying,
  bindEvents: bindEvents
};
