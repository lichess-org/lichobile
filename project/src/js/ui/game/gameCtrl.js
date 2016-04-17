import session from '../../session';
import { hasNetwork, handleXhrError, getOfflineGameData, saveOfflineGameData, removeOfflineGameData } from '../../utils';
import { game as gameXhr } from '../../xhr';
import storage from '../../storage';
import roundCtrl from '../round/roundCtrl';
import helper from '../helper';
import gameApi from '../../lichess/game';
import variantApi from '../../lichess/variant';
import gamesMenu from '../gamesMenu';
import sound from '../../sound';
import i18n from '../../i18n';
import m from 'mithril';

export default function controller() {
  var gameData;
  var round;

  if (hasNetwork()) {
    gameXhr(m.route.param('id'), m.route.param('color'), !!gamesMenu.lastJoined).then(function(data) {
      gameData = data;

      if (!data.player.spectator && !gameApi.isSupportedVariant(data)) {
        window.plugins.toast.show(i18n('unsupportedVariant', data.game.variant.name), 'short', 'center');
        m.route('/');
      }
      else {

        if (gameData.player.spectator) {
          helper.analyticsTrackView('Online Game (spectator)');
        } else {
          helper.analyticsTrackView('Online Game (player)');
          if (gameApi.isPlayerPlaying(data)) {
            helper.analyticsTrackEvent('Online Game', `Variant ${data.game.variant.key}`);
            helper.analyticsTrackEvent('Online Game', `Speed ${data.game.speed}`);
          }
        }

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
          session.refresh();
          if (!gameApi.playable(gameData)) {
            removeOfflineGameData(m.route.param('id'));
          } else {
            saveOfflineGameData(m.route.param('id'), gameData);
          }
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
    },
    getRound: function() {
      return round;
    },
    getData: function() {
      return gameData;
    }
  };
}

function variantStorageKey(variant) {
  return 'game.variant.prompt.' + variant;
}
