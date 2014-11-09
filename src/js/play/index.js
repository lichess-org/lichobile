var xhr = require('./xhr');
var round = require('../round');
var StrongSocket = require('../StrongSocket');
var mainView = require('../mainView');
var m = require('mithril');
var Chessground = require('chessground');

var play = {};

play.controller = function() {
  this.round = null;
  this.socket = null;

  this.started = function () { return this.round; };

  this.chessground = new Chessground.controller({ movable: { color: null}});

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
      self.round = new round.controller(data, self.chessground, self.socket.send.bind(self.socket));
    });
  }.bind(this);

};

play.view = function(ctrl) {
  function renderBoard() {
    if (ctrl.started())
      return round.view(ctrl.round);
    else
      return m('div.chessground.wood.merida.withMoved.withDest', [
        Chessground.view(ctrl.chessground)
      ]);
  }

  return mainView(ctrl, function() {
    return m('div', [
      renderBoard(),
      m('button', { config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.startAIGame);
      }}, 'Start!')
    ]);
  });
};

module.exports = play;
