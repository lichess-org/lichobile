var session = require('../../session');
var utils = require('../../utils');
var xhr = require('../../xhr');
var storage = require('../../storage');
var roundCtrl = require('../round/roundCtrl');
var gameStatus = require('../../lichess/status');
var socket = require('../../socket');

module.exports = function() {
  const isAwaitingInvite = m.prop(false);
  const isAwaitingChallenge = m.prop(false);
  const isJoinable = m.prop(false);
  var gameData;
  var round;
  var awaitSocket;
  var challengeIntervalID;

  xhr.game(m.route.param('id'), m.route.param('color')).then(function(data) {
    gameData = data;
    if (data.game.joinable)
      isJoinable(true);
    // status created means waiting for friend to join game invit or challenge
    else if (data.game.status.id === gameStatus.ids.created) {
      awaitSocket = socket.await(data.url.socket, data.player.version, {
        redirect: function(e) {
          m.route('/game/' + e.id);
        }
      });
      // userId param means it's a challenge, otherwise it's an invitation by url
      if (m.route.param('userId')) {
        isAwaitingChallenge(true);
        // to keep challenge open
        challengeIntervalID = setInterval(() => {
          if (awaitSocket) awaitSocket.send('challenge', m.route.param('userId'));
        }, 1500);
      } else isAwaitingInvite(true);
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
      if (challengeIntervalID) clearInterval(challengeIntervalID);
      if (awaitSocket) {
        awaitSocket.destroy();
        awaitSocket = null;
      }
    },
    getRound: function() {
      return round;
    },
    isJoinable,
    isAwaitingInvite,
    isAwaitingChallenge,
    joinUrlChallenge: id => xhr.joinUrlChallenge(id).then(data =>
      m.route('/game' + data.url.round)
    ),
    cancelChallenge: () => {
      xhr.cancelChallenge(gameData.url.round);
      if (challengeIntervalID) clearInterval(challengeIntervalID);
      utils.backHistory();
    },
    getData: function() {
      return gameData;
    }
  };
};
