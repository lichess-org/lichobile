import session from '../../session';
import helper from '../helper';
import { hasNetwork, handleXhrError, backHistory, getOfflineGameData, saveOfflineGameData, removeOfflineGameData } from '../../utils';
import { game as gameXhr, joinChallenge, cancelChallenge } from '../../xhr';
import storage from '../../storage';
import roundCtrl from '../round/roundCtrl';
import gameStatus from '../../lichess/status';
import gameApi from '../../lichess/game';
import variantApi from '../../lichess/variant';
import socket from '../../socket';
import gamesMenu from '../gamesMenu';
import sound from '../../sound';
import i18n from '../../i18n';
import m from 'mithril';

export default function controller() {
  const isAwaitingInvite = m.prop(false);
  const isAwaitingChallenge = m.prop(false);
  const isJoinable = m.prop(false);
  var gameData;
  var round;
  var challengeIntervalID;

  if (hasNetwork()) {
    gameXhr(m.route.param('id'), m.route.param('color'), !!gamesMenu.lastJoined).then(function(data) {
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
            backHistory();
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
          window.plugins.insomnia.keepAwake();
        } else {
          helper.analyticsTrackView('Waiting for URL invitation acceptance');
          isAwaitingInvite(true);
        }
      }
      // if not joinable or created, it means the game is started, so let's play!
      else {
        session.refresh();

        if (gameApi.isPlayerPlaying(data) &&
        gameApi.nbMoves(data, data.player.color) === 0) {
          sound.dong();
          const variant = variantApi(data.game.variant.key);
          const storageKey = variantStorageKey(data.game.variant.key);
          if ([1, 3].indexOf(variant.id) === -1 &&
          !storage.get(storageKey)) {
            window.navigator.notification.alert(variant.alert, function() {
              storage.set(storageKey, true);
            });
          }
        }

        round = new roundCtrl(data);

        if (data.player.user === undefined) {
          storage.set('lastPlayedGameURLAsAnon', data.url.round);
        }

        if (gameData.game.speed === 'correspondence') {
          saveOfflineGameData(m.route.param('id'), gameData);
        }

      }
    }, function(error) {
      handleXhrError(error);
      m.route('/');
    });
  } else {
    const savedData = getOfflineGameData(m.route.param('id'));
    if (savedData) {
      gameData = savedData;
      if (!gameApi.playable(gameData)) {
        removeOfflineGameData(m.route.param('id'));
      }
      round = new roundCtrl(gameData);
    } else {
      window.plugins.toast.show('Could not find saved data for this game', 'short', 'center');
      m.route('/');
    }
  }

  return {
    onunload: function() {
      if (round) {
        round.onunload();
        round = null;
      }
      if (challengeIntervalID) clearInterval(challengeIntervalID);
      socket.destroy();
      window.plugins.insomnia.allowSleepAgain();
    },
    getRound: function() {
      return round;
    },
    isJoinable,
    isAwaitingInvite,
    isAwaitingChallenge,
    joinChallenge: id => joinChallenge(id).then(data =>
      m.route('/game' + data.url.round)
    ),
    cancelChallenge: () => {
      cancelChallenge(gameData.url.round);
      if (challengeIntervalID) clearInterval(challengeIntervalID);
      backHistory();
    },
    getData: function() {
      return gameData;
    }
  };
}

function variantStorageKey(variant) {
  return 'game.variant.prompt.' + variant;
}
