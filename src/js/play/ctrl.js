var xhr = require('./xhr');
var round = require('../round');
var StrongSocket = require('../StrongSocket');
var Chessground = require('chessground');
var m = require('mithril');
var storage = require('../storage');

function makeSocket(ctrl, data) {
  return new StrongSocket(
    data.url.socket,
    data.player.version,
    {
      options: {
        name: "game",
        debug: true
      },
      receive: function(t, d) { return ctrl.round.socket.receive(t, d); }
    }
  );
}

function makeRound(ctrl, data) {
  return new round.controller(data, null, ctrl.strongSocket.send.bind(ctrl.strongSocket));
}

module.exports = function() {
  this.id = m.route.param('id');
  this.round = null;
  this.strongSocket = null;

  this.playing = function () { return this.round; };

  this.chessground = new Chessground.controller({viewOnly: true});

  this.resumeGame = function (id) {
    var self = this;
    xhr.game(id).then(function (data) {
      self.strongSocket = makeSocket(self, data);
      self.round = makeRound(self, data);
    });
  }.bind(this);

  this.startAIGame = function() {
    var self = this;
    xhr.aiGame().then(function(data) {
      self.strongSocket = makeSocket(self, data);
      self.round = makeRound(self, data);
      m.route(data.url.round);
    });
  }.bind(this);

  this.onunload = function() {
    if (this.strongSocket) this.strongSocket.destroy();
    this.strongSocket = null;
  };

  if (this.id) this.resumeGame(this.id);
};
