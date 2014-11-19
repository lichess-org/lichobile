var xhr = require('./playXhr');
var roundCtrl = require('../round/roundCtrl');
var StrongSocket = require('../StrongSocket');
var Chessground = require('chessground');
var menu = require('../menu');
var overlay = require('./overlay');

function makeGameSocket(ctrl, data) {
  return new StrongSocket(
    data.url.socket,
    data.player.version,
    {
      options: { name: "game", debug: true },
      receive: function(t, d) { return ctrl.round.socket.receive(t, d); }
    }
  );
}

function makeLobbySocket(ctrl) {
  return new StrongSocket(
    '/lobby/socket/v1',
    0,
    {
      options: { name: 'lobby', pingDelay: 2000 },
      events: {
        redirect: function(data) {
          ctrl.lobbySocket.destroy();
          m.route('/' + data.id);
        }
      }
    }
  );
}

function makeRound(ctrl, data) {
  return new roundCtrl(data, null, ctrl.gameSocket.send.bind(ctrl.gameSocket));
}

module.exports = function() {
  this.id = m.route.param('id');

  this.title = function() {
    if (this.round) return this.round.title;
    return 'lichess.org';
  };

  this.round = null;
  this.gameSocket = null;
  this.lobbySocket = null;

  this.playing = function () { return this.round; };

  this.overlay = new overlay.controller();
  this.menu = new menu.controller();

  this.chessground = new Chessground.controller({viewOnly: true});

  this.resumeGame = function(id) {
    var self = this;
    xhr.game(id).then(function (data) {
      self.gameSocket = makeGameSocket(self, data);
      self.round = makeRound(self, data);
    });
  }.bind(this);

  this.startAIGame = function() {
    xhr.aiGame().then(function(data) {
      m.route(data.url.round);
    });
  }.bind(this);

  this.seekHumanGame = function() {
    this.lobbySocket = makeLobbySocket(this);
    xhr.seekHuman().then(function() {
      console.log('hook sent...');
    });
  }.bind(this);

  this.onunload = function() {
    if (this.round) {
      this.round.onunload();
      this.round = null;
    }
    if (this.gameSocket) {
      this.gameSocket.destroy();
      this.gameSocket = null;
    }
  };

  if (this.id) this.resumeGame(this.id);
};
