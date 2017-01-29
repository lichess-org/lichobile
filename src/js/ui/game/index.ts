import session from '../../session';
import router from '../../router';
import { hasNetwork, handleXhrError, gamePosCache } from '../../utils';
import { getOfflineGameData, saveOfflineGameData, removeOfflineGameData } from '../../utils/offlineGames';
import { game as gameXhr } from '../../xhr';
import storage from '../../storage';
import OnlineRound from '../shared/round/OnlineRound';
import * as helper from '../helper';
import * as gameApi from '../../lichess/game';
import variantApi from '../../lichess/variant';
import sound from '../../sound';
import vibrate from '../../vibrate';
import i18n from '../../i18n';
import socket from '../../socket';
import { emptyFen } from '../../utils/fen';
import roundView from '../shared/round/view/roundView';
import gamesMenu from '../gamesMenu';
import layout from '../layout';
import { connectingHeader, viewOnlyBoardContent } from '../shared/common';

interface Attrs {
  id: string
  color: Color
}

interface State {
  round?: OnlineRound
}

const GameScreen: Mithril.Component<Attrs, State> = {
  oninit(vnode) {
    let gameData: OnlineGameData;

    if (hasNetwork()) {
      gameXhr(vnode.attrs.id, vnode.attrs.color)
      .then(data => {
        gameData = data;

        if (!data.player.spectator && !gameApi.isSupportedVariant(data)) {
          window.plugins.toast.show(i18n('unsupportedVariant', data.game.variant.name), 'short', 'center');
          router.set('/');
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
            vibrate.quick();
            const variant = variantApi(data.game.variant.key);
            const storageKey = variantStorageKey(data.game.variant.key);
            if ([1, 3].indexOf(variant.id) === -1 &&
            !storage.get(storageKey)) {
              window.navigator.notification.alert(variant.alert, function() {
                storage.set(storageKey, true);
              });
            }
          }

          this.round = new OnlineRound(vnode.attrs.id, data);
          gamesMenu.resetLastJoined();

          if (data.player.user === undefined) {
            storage.set('lastPlayedGameURLAsAnon', data.url.round);
          }

          if (gameData.game.speed === 'correspondence') {
            session.refresh();
            if (!gameApi.playable(gameData)) {
              removeOfflineGameData(vnode.attrs.id);
            } else {
              saveOfflineGameData(vnode.attrs.id, gameData);
            }
          }

        }
      })
      .catch(error => {
        handleXhrError(error);
        router.set('/');
      });
    } else {
      const savedData = getOfflineGameData(vnode.attrs.id);
      if (savedData) {
        gameData = savedData;
        if (!gameApi.playable(gameData)) {
          removeOfflineGameData(vnode.attrs.id);
        }
        this.round = new OnlineRound(vnode.attrs.id, gameData);
      } else {
        window.plugins.toast.show('Could not find saved data for this game', 'short', 'center');
        router.set('/');
      }
    }
  },

  oncreate(vnode) {
    if (vnode.attrs.color) {
      helper.pageSlideIn(vnode.dom as HTMLElement);
    } else {
      helper.elFadeIn(vnode.dom as HTMLElement);
    }
  },

  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    socket.destroy();
    if (this.round) {
      this.round.unload();
    }
  },

  view({ attrs }) {
    if (this.round) return roundView(this.round);

    const pov = gamesMenu.lastJoined();
    let board: () => Mithril.Child;

    if (pov) {
      board = () => viewOnlyBoardContent(pov.fen, pov.lastMove, pov.color,
        pov.variant.key);
    } else {
      const g = gamePosCache.get(attrs.id)
      if (g)
        board = () => viewOnlyBoardContent(g.fen, null, g.orientation);
      else
        board = () => viewOnlyBoardContent(emptyFen);
    }

    return layout.board(connectingHeader, board);
  }
};

function variantStorageKey(variant: string) {
  return 'game.variant.prompt.' + variant;
}

export default GameScreen
