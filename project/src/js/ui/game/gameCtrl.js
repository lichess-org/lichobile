var session = require('../../session');
var utils = require('../../utils');
var xhr = require('../../xhr');
var storage = require('../../storage');
var roundCtrl = require('../round/roundCtrl');

module.exports = function() {
  var joinable = false;
  var gameData;
  var round;

  xhr.game(m.route.param('id'), m.route.param('pov')).then(function(data) {
    if (data.game.joinable) {
      gameData = data;
      joinable = true;
    } else {
      if (session.isConnected()) session.refresh();
      round = new roundCtrl(data);
      if (data.player.user === undefined)
        storage.set('lastPlayedGameURLAsAnon', data.url.round);
    }
  }, function(error) {
    utils.handleXhrError(error);
    m.route('/');
  });

  return {
    onunload: function() {
      if (round) {
        round.onunload();
        round = null;
      }
    },
    round: function() {
      return round;
    },
    joinable: function() {
      return joinable;
    },
    joinUrlChallenge: function(id) {
      xhr.joinUrlChallenge(id).then(function(data) {
        m.route('/game' + data.url.round);
      });
    },
    data: function() {
      return gameData;
    }
  };
};
