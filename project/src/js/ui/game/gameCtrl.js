import session from '../../session';
import utils from '../../utils';
import xhr from '../../xhr';
import storage from '../../storage';
import roundCtrl from '../round/roundCtrl';
import gameStatus from '../../lichess/status';
import gameApi from '../../lichess/game';
import socket from '../../socket';
import i18n from '../../i18n';

export default function() {
  const isAwaitingInvite = m.prop(false);
  const isAwaitingChallenge = m.prop(false);
  const isJoinable = m.prop(false);
  var gameData;
  var round;
  var challengeIntervalID;

  xhr.game(m.route.param('id'), m.route.param('color')).then(function(data) {
    gameData = data;

    if (!data.player.spectator && !gameApi.isSupportedVariant(data)) {
      window.plugins.toast.show(i18n('unsupportedVariant', data.game.variant.name), 'short', 'center');
      m.route('/');
    }
    else if (data.game.joinable)
      isJoinable(true);
    // status created means waiting for friend to join game invit or challenge
    else if (data.game.status.id === gameStatus.ids.created) {
      socket.createAwait(data.url.socket, data.player.version, {
        redirect: e => m.route('/game/' + e.id),
        declined: () => {
          window.plugins.toast.show('Challenge declined', 'short', 'center');
          utils.backHistory();
        }
      });
      // userId param means it's a challenge, otherwise it's an invitation by url
      if (m.route.param('userId')) {
        isAwaitingChallenge(true);
        // to keep challenge open
        challengeIntervalID = setInterval(() => {
          socket.send('challenge', m.route.param('userId'));
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
      socket.destroy();
    },
    getRound: function() {
      return round;
    },
    isJoinable,
    isAwaitingInvite,
    isAwaitingChallenge,
    joinChallenge: id => xhr.joinChallenge(id).then(data =>
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
