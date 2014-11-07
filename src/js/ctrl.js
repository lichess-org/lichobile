'use strict';

var round = require('./round');
var xhr = require('./xhr');
var StrongSocket = require('./StrongSocket');

module.exports = function() {

  this.round = null;
  this.socket = null;

  this.startAIGame = function() {
    var self = this;
    xhr.aiGame().then(function(data) {
      self.socket = new StrongSocket(
        data.url.socket,
        data.player.version,
        {
          options: {
            name: "game",
            debug: true
          },
          receive: function(t, d) { return self.round.socket.receive(t, d); }
        }
      );
      self.round = new round.controller(data, null, self.socket.send.bind(self.socket));
    });
  };

  this.startAIGame();
};
