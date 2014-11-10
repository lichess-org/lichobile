var xhr = require('./xhr');
var round = require('../round');
var StrongSocket = require('../StrongSocket');
var Chessground = require('chessground');

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

module.exports = function() {
  this.round = null;
  this.strongSocket = null;

  this.playing = function () { return this.round; };

  this.chessground = new Chessground.controller({ movable: { color: null}});

  this.startAIGame = function() {
    var self = this;
    xhr.aiGame().then(function(data) {
      self.strongSocket = makeSocket(self, data);
      self.round = new round.controller(data, self.chessground, self.strongSocket.send.bind(self.strongSocket));
    });
  }.bind(this);

};
