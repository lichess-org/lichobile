import * as utils from '../utils';
import redraw from '../utils/redraw';
import * as helper from './helper';
import router from '../router';
import { loader } from './shared/common';
import popupWidget from './shared/popup';
import * as xhr from '../xhr';
import i18n from '../i18n';
import socket, { RedirectObj } from '../socket';
import { LobbyData } from '../lichess/interfaces';
import * as m from 'mithril';

let nbPlayers = 0;
let nbGames = 0;
let hookId: string = null;

let isOpen = false;

export default {
  startSeeking,
  cancelSeeking,
  view() {
    const nbPlayersStr = i18n('nbConnectedPlayers', nbPlayers || '?');
    const nbGamesStr = i18n('nbGamesInPlay', nbGames || '?');
    function content() {
      return m('div.seek_real_time', [
        m('div.nb_players', socket.isConnected() ?
        m.trust(nbPlayersStr.replace(/(\d+)/, '<strong>$1</strong>')) :
        m('div', [i18n('reconnecting'), loader])
        ),
        m('div.nb_players', socket.isConnected() ?
        m.trust(nbGamesStr.replace(/(\d+)/, '<strong>$1</strong>')) :
        m('div', [i18n('reconnecting'), loader])
        ),
        m('br'),
        m('br'),
        m('button[data-icon=L]', {
          oncreate: helper.ontap(() => cancelSeeking())
        }, i18n('cancel'))
      ]);
    }

    return popupWidget(
      null,
      () => m('div', i18n('waitingForOpponent') + '...'),
      content,
      isOpen
    );
  }
}

function startSeeking() {
  router.backbutton.stack.push(cancelSeeking);

  isOpen = true;
  window.plugins.insomnia.keepAwake();
  hookId = null;

  xhr.lobby(true).then(data => {
    socket.createLobby(data.lobby.version, createHook, {
      redirect: (d: RedirectObj) => {
        closePopup();
        helper.analyticsTrackEvent('Seek', 'Found');
        socket.redirectToGame(d);
      },
      n: (_: void, d: PongMessage) => {
        nbPlayers = d.d;
        nbGames = d.r;
        redraw();
      },
      resync: () => xhr.lobby().then((d: LobbyData) => {
        socket.setVersion(d.lobby.version);
      })
    });
  });
};

function closePopup(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
};

function cancelSeeking(fromBB?: string) {
  closePopup(fromBB);

  if (hookId) socket.send('cancel', hookId);
  hookId = null;

  window.plugins.insomnia.allowSleepAgain();

  socket.restorePrevious();

  helper.analyticsTrackEvent('Seek', 'Canceled');
};


function createHook() {
  if (hookId) return; // hook already created!
  xhr.seekGame()
  .then(data => {
    helper.analyticsTrackEvent('Seek', 'Created');
    hookId = data.hook.id;
  })
  .catch(utils.handleXhrError);
}
