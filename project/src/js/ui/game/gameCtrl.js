var session = require('../../session');
var utils = require('../../utils');
var xhr = require('../../xhr');
var storage = require('../../storage');
var roundCtrl = require('../round/roundCtrl');
var gameStatus = require('../../lichess/status');

module.exports = function() {
  var awaiting = false;
  var joinable = false;
  var gameData;
  var round;

  xhr.game(m.route.param('id'), m.route.param('pov')).then(function(data) {
    gameData = data;
    if (data.game.joinable)
      joinable = true;
    // status created means waiting for friend to join game invit
    else if (data.game.status.id === gameStatus.ids.created)
      awaiting = true;
    else {
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
    getRound: function() {
      return round;
    },
    isJoinable: function() {
      return joinable;
    },
    isAwaiting: function() {
      return awaiting;
    },
    joinUrlChallenge: function(id) {
      xhr.joinUrlChallenge(id).then(function(data) {
        m.route('/game' + data.url.round);
      });
    },
    getData: function() {
      return gameData;
    }
  };
};
