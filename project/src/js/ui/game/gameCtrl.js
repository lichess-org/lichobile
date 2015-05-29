import session from '../../session';
import helper from '../helper';
import utils from '../../utils';
import xhr from '../../xhr';
import storage from '../../storage';
import roundCtrl from '../round/roundCtrl';
import gameStatus from '../../lichess/status';
import gameApi from '../../lichess/game';
import socket from '../../socket';
import i18n from '../../i18n';

export default function controller() {
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
    // joinable means it's a game opened from an url scheme (url invitation from
    // a friend)
    else if (data.game.joinable) {
      helper.analyticsTrackView('Join url invitation');
      isJoinable(true);
    }
    // status created means user has sent an url invitation or challenge, and is
    // waiting for friend to join
    else if (data.game.status.id === gameStatus.ids.created) {
      socket.createAwait(data.url.socket, data.player.version, {
        redirect: e => m.route('/game/' + e.id),
        declined: () => {
          window.plugins.toast.show('Challenge declined', 'short', 'center');
          utils.backHistory();
        }
      });
      // userId param means it's a challenge, otherwise it's an invitation with url
      if (m.route.param('userId')) {
        helper.analyticsTrackView('Waiting for challenge acceptance');
        isAwaitingChallenge(true);
        // to keep challenge open
        challengeIntervalID = setInterval(() => {
          socket.send('challenge', m.route.param('userId'));
        }, 1500);
      } else {
        helper.analyticsTrackView('Waiting for URL invitation acceptance');
        isAwaitingInvite(true);
      }
    }
    // if not joinable or created, it means the game is started, so let's play!
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
}
