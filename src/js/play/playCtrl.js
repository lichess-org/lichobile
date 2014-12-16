var xhr = require('./playXhr');
var roundCtrl = require('../round/roundCtrl');
var StrongSocket = require('../StrongSocket');
var Chessground = require('chessground');

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
          m.route('/play' + data.url);
          ctrl.lobbySocket.destroy();
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

  this.vm = {
    isSeekingGame: false
  };

  this.round = null;
  this.gameSocket = null;
  this.lobbySocket = null;

  this.playing = function () { return this.round; };

  this.chessground = new Chessground.controller({viewOnly: true});

  var resumeGame = function(id) {
    var self = this;
    xhr.game(id).then(function (data) {
      self.gameSocket = makeGameSocket(self, data);
      self.round = makeRound(self, data);
    });
  }.bind(this);

  this.joinGame = function(id) {
    m.route('/play/' + id);
  }.bind(this);

  this.startAIGame = function() {
    xhr.aiGame().then(function(data) {
      m.route('/play' + data.url.round);
    });
  }.bind(this);

  this.seekHumanGame = function() {
    this.vm.isSeekingGame = true;
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

  if (this.id) resumeGame(this.id);
};
