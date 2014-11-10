var xhr = require('./xhr');
var round = require('../round');
var StrongSocket = require('../StrongSocket');
var Chessground = require('chessground');
var m = require('mithril');

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
          ctrl.resumeGame(data.id);
        }
      }
    }
  );
}

function makeRound(ctrl, data) {
  return new round.controller(data, null, ctrl.gameSocket.send.bind(ctrl.gameSocket));
}

module.exports = function() {
  this.id = m.route.param('id');
  this.round = null;
  this.gameSocket = null;
  this.lobbySocket = null;

  this.playing = function () { return this.round; };

  this.chessground = new Chessground.controller({viewOnly: true});

  this.resumeGame = function(id) {
    var self = this;
    xhr.game(id).then(function (data) {
      self.gameSocket = makeGameSocket(self, data);
      self.round = makeRound(self, data);
    });
  }.bind(this);

  this.startAIGame = function() {
    var self = this;
    xhr.aiGame().then(function(data) {
      self.gameSocket = makeGameSocket(self, data);
      self.round = makeRound(self, data);
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
    if (this.gameSocket) this.gameSocket.destroy();
    this.gameSocket = null;
  };

  if (this.id) this.resumeGame(this.id);
};
